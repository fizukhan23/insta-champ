const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
    uid:{type:Number,required:true},
    data:{type:String},
});

notificationSchema.set('timestamps', true);
module.exports = mongoose.model("notification", notificationSchema);