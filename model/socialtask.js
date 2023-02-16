const mongoose = require("mongoose");

const socialtaskSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
    // assignedBy:{type:String},
    task:{type:String},
     poster:{type:String},
     link:{type:String}
   
});

socialtaskSchema.set('timestamps', true);
module.exports = mongoose.model("socialtask", socialtaskSchema);