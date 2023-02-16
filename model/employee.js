const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name:{type:String},
    mobile:{type:String},
    father_name:{type:String},
    email:{type:String},
    gender:{type:String},
    dob:{type:Date},
    martial_status:{type:String},
    address:{type:String},
    pincode:{type:Number},
    city:{type:String},
    state:{type:String},
    pan_card:{type:Number},
    aadhar_card:{type:Number},
    passport_photo:{type:String},
    position:{type:String},
    salary:{type:Number},
    joining_date:{type:Date},
    salary_date:{type:Date},
    location:{type:String},
    branchcode:{type:String},
});
employeeSchema.set('timestamps', true);
module.exports = mongoose.model("employee", employeeSchema);