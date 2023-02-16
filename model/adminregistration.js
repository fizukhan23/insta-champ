const mongoose = require("mongoose");

const adminregistrationSchema = new mongoose.Schema({
    id:{type:mongoose.ObjectId},
    kyc_document:{type:String},
    aadhar:{type:String},
    pan_card:{type:String},
    fullname:{type:String},
    dob:{type:Date},
    email:{type:String},
    password:{type:String},
    phone:{type:Number},
    region:{type:String},
    branch:{type:String},
    photo:{type:String},
    ophoto:{type:String},
    Rdocument:{type:String},
    faddress:{type:String}
});

adminregistrationSchema.set('timestamps', true);
module.exports = mongoose.model("adminregistration", adminregistrationSchema);