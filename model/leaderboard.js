const mongoose = require("mongoose");

const leaderSchema = new mongoose.Schema({
    pos:{type:String,max:10,min:1},
    uid:{type:Number},
    name:{type:String},
    boarddata:{}
});

leaderSchema.set('timestamps', true);
module.exports = mongoose.model("leader", leaderSchema);