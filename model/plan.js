const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
    code:{type:String,required:true},
    tier:{type:String},
    amount:{type:Number},
    name:{type:String}
});

planSchema.set('timestamps', true);
module.exports = mongoose.model("plan", planSchema);