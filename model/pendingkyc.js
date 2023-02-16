const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
    uid:{type:Number,required:true},
    filepath:{type:String,required:true},
});

kycSchema.set('timestamps', true);

module.exports = mongoose.model("kyc", kycSchema);