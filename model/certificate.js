const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
     uid:{type:Number,required:true},
     certificate:{type:String}
});

certificateSchema.set('timestamps', true);
module.exports = mongoose.model("certificate", certificateSchema);