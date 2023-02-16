const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
    status:{type:String,default:"pending"},
    uid:{type:Number,required:true},
    targetdata:{type:String},
});
targetSchema.set('timestamps', true);
module.exports = mongoose.model("target", targetSchema);