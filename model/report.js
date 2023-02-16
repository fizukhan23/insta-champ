const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    sno:{type:Number,required:false},
    uid:{type:Number,required:true},
    date:{type:Date, required:true},
    work:{type:String, required:true},
    task:{type:String, reqired:true},
    earning:{type:String, reqired:true}

});

reportSchema.set('timestamps', true);
module.exports = mongoose.model("report", reportSchema);