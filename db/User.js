// scehma for the api which will take signup data to the database
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: String,
    email : String,
    password: String
});

module.exports = mongoose.model("products",UserSchema);