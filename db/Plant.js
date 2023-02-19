const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    name:String,
    price:String,
    category:String,
    userId:String,
});

module.exports = mongoose.model("plants",plantSchema);