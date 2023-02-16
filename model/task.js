const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
    // assignedBy:{type:String},
    status:{type:String,default:"pending"},
    uid:{type:Number,required:true},
    taskdata:{type:String},
});

taskSchema.set('timestamps', true);
module.exports = mongoose.model("task", taskSchema);