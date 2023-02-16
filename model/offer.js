const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
    code:{type:String,required:true},
    offerdata:{type:String},
    status:{type:String,default:'active'},
    validtill:{type:Date}
});

offerSchema.set('timestamps', true);
module.exports = mongoose.model("offer", offerSchema);