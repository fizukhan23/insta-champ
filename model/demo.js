const mongoose = require("mongoose");

const demoSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
     video:{type:String},
     description:{type:String}
});

demoSchema.set('timestamps', true);
module.exports = mongoose.model("demo", demoSchema);