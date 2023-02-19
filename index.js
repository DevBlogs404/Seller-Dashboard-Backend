// making an express app
const express = require('express');
const app = express();

// importing config and user,plant (scehma) files 
require('./db/config');
const User = require('./db/User');
const Plant = require('./db/Plant');

//api token securing using JWT
const Jwt = require('jsonwebtoken');
const jwtkey = "e-plant";

//to avoid cors or uncaught in pormise error
const cors  = require('cors');
app.use(cors());

//to send user signup data in form of json
app.use(express.json());

//this api will be used in frontend for sending signUp data of users to database
app.post('/signup',async (req,res)=>{
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();  // converting the result to object so that we can delete the password to be shown as a result of the api, must for security
    delete result.password ;
    Jwt.sign({result},key,{expiresIn:'2h'},(err,token)=>{
        if(err){
            res.send({result:"something went wrong! try again after some time."})
        }
        res.send({result,auth:token});
    });
});

//login api for authenticating users on client side
app.post('/login',async(req,res)=>{
    if(req.body.email && req.body.password){
        let user = await User.findOne(req.body).select('-password');    // can only use select and use (-)minus. for ex. -password here on find or findone method
        if(user){
            Jwt.sign({user},key,{expiresIn:'2h'},(err,token)=>{
                if(err){
                    res.send({result:"something went wrong! try again after some time."})
                }
                res.send({user,auth:token});
            });
        } else{
            res.send({result: "no user found"})
        }
    }else{
        res.send({result: "no user found"})
    }
});

// plant api for getting info from client to add to database
app.post('/add-plant', middleWare, async (req,res)=>{
    const plant = new Plant(req.body);
    let result = await plant.save();
    res.send(result);
});

//plant-listing api for listing all plants in databse to frontend 
app.get('/plant-list', middleWare,async(req,res)=>{
    let plants = await Plant.find(req.body);
    if(plants.length>0){
        res.send(plants)
    }else{
        res.send({result:"no plants found"})
    }
});

//plant delete api for a specific plant stored in database
app.delete('/plant/:id',middleWare, async (req,res)=>{
    const result = await Plant.deleteOne({_id : req.params.id});
    if(result){
        res.send(result)
    }else{
        res.send({result:"no plant found"})
    }
});

//api for gettting single plant/product for prefilling the update form
app.get('/plant/:id', middleWare,async(req,res)=>{
    const result = await Plant.findOne({_id : req.params.id});
    if(result){
        res.send(result)
    }else{
        res.send({result:"no plant found"})
    }
});

//api for updating single plant/product in the update product component in the frontend
app.put('/plant/:id',middleWare,async(req,res)=>{
    //updateOne method takes two parameters as objects: updateOne({the object to be updated},{the data to be updated});
    const result = await Plant.updateOne(
        { _id : req.params.id},
        {
            $set : req.body
        }
        );
    if(result){
        res.send(result)
    }else{
        res.send({result:"no record found to be updated"})
    }
});

//search api 
app.get('/search/:key', middleWare, async (req,res)=>{
    let result = await Plant.find({
        "$or": [
            {name : {$regex: req.params.key}},
            {category : {$regex: req.params.key}}
        ]
    });
    res.send(result);
});


//middleware for jwt verification(middleware is a function which has three parameters(req,res,next))
function middleWare(req,res,next){
    let token = req.headers['authorization'];
    if(token){
        token = token.split(' ')[1];
        Jwt.verify(token, jwtkey, (err,valid) =>{
            if(err){
                res.status(401).send({ result: "please provide valid tokens" })
            }else{
                next();
            }
        })
    }else{
        res.status(403).send({ result: "please add tokens with headers" })
    }
};

//api running on this port
app.listen(5000);




