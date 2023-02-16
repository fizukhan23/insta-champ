const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    uid:{type:Number,required:true},
    username:{type:String,default:null},
    mobile:{type: Number,default:0},
    email:{type:String},
    position:{},
    location:{type:String,required:false,enum:['north','south']},
    code: { type: String },
    password: { type: String },
    token: { type: String },
    hsn_token:{type:String},
    role: { type: String, default:'user'},
    type:{type:String,default:'normal',enum:['normal','prime','branch']},
    wallet:{type:Number,default:0},
    statuss:{type:String,default:"Notapproved"},
    kyc:{
      status:{type:String,default:"pending"},
      path:{type:String,default:null}
    //   more fields come here
    },
    profile_image:{
        name:{type:String,default:null},
        path:{type:String,default:null}
    },
    file:{
        name:{type:String,default:null},
        path:{type:String,default:null}
    }
});

testSchema.set('timestamps', true);

module.exports = mongoose.model("user", testSchema);