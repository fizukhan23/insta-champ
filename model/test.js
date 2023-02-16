const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    name:{type:String,required:true},
    age:{type:Number},
    city:{type:String}
});

testSchema.set('timestamps', true);
module.exports = mongoose.model("test", testSchema);