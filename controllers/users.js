var express = require('express');
require("dotenv").config();

const Notifications = require("../model/notifications");

const Test = require("../model/test");

const User = require("../model/user");
const Offer = require("../model/offer");

const Report = require("../model/report");
const Task = require("../model/task");
const Target = require("../model/target");
const Leader = require("../model/leaderboard");
const Invoice = require("../model/invoice");
const Plan = require("../model/plan");
const auth = require("../middleware/auth");
const app = express();
app.use(express.json());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var multer = require('multer');
const path = require('path');
var uploads = multer({ storage: storage });
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images/test/'));
  }, 
  filename: (req, file, cb) => {
    cb(null, Date.now() +"img"+ path.extname(file.originalname));
  }
});
var upload = multer({ storage: storage });
const fs = require('fs');

var BASE = process.env.BASE_URL;

app.use(function(req, res, next) {
  res.locals.user = req.session.userdetail;
  console.log(req.session.userdetail);
  next();
});

app.get('/', function (req, res, next) {
  res.send('respond with a resource');

});

// practice
app.post("/trial",upload.none(), async (req,res)=>{
   try{
       const {name,age} = req.body;
       const user = await Test.create({
           name,
           age
       })
       console.log(user),
       res.status(200).json({Person:user});
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.get("/testusers",async(req,res)=>{
   try{
      const users = await Test.find({});
    // const user = await Test.findOne({name:'Sam',age:null});
       console.log(users);
       res.status(200).json({Users:users});
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
       
});

app.post("/update",upload.none(),async(req,res)=>{
   try{
    //   const users = await Test.updateOne({name:"Tushar"},{$set:{age:25}});
      const qwrt = await Test.updateMany({name:"Tushar"},{$set:{city:"Delhi"}});
       const data = await Test.find({});
       res.status(201).json({data:data});
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});


app.post("/delete",upload.none(),async(req,res)=>{
    try{
        // const remove = await Test.deleteOne({name:"Sam",age:null});
        const rem = await Test.deleteMany({});
        res.status(201).json({data:rem});
    }catch(err){
         console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
    }
})

// practice

app.post("/register", upload.none(), async (req, res, next) => {
  try {
    const { email, password, type, hsn_token } = req.body;
    if (!(email && password)) {
      res.status(400).send({status:400,message:"All input is required",success:false});
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      console.log(oldUser);
      return res.status(409).send({status:409,message:"User Already Exist. Please Login",success:false});
    }
    const uid = await User.estimatedDocumentCount()+1;
    console.log(uid);
    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        uid:uid,
        hsn_token,
      email: email.toLowerCase(),
      password: encryptedPassword,
      type,
    });
    const token = jwt.sign(
      { user_id: user._id,uid, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    res.status(201).json({status:201,message:"New user created",success:true,data:user});
  } catch (err) {
    console.log(err);
    res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
  }
});

app.post("/login", upload.none(), async (req, res) => {
  try {
    const { mobile,password,username,type } = req.body;
    let uid;
    
    if (!(mobile && password && username)){
      return res.status(400).send({status:400,message:"All input is required",success:false});
    }else{
        const users = await User.find({role:'user'});
        if(users.length==0){
            uid=1;
        }else{
         uid = users[users.length-1].uid+1;   
        }
        encryptedPassword = await bcrypt.hash(password, 10);
    let user = await User.findOne({ mobile:mobile,type:'normal'});
    if (!user) {
        const list = await User.estimatedDocumentCount()+1;
        encryptedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            uid:uid,
            mobile,
            username,
            password: encryptedPassword,
            type:'normal',
    });
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
        sessionVar = req.session;
        sessionVar.userdetail = user;
        sessionVar.save();
      if (user.role == 'admin') {
        // res.render('/admin/dashbord');
        res.status(200).json({status:200,message:"Admin logged-in",success:true,data:user})
      } else {
        // res.render('/user/dashbord');
        res.status(200).json({status:200,message:"User logged-in",success:true,data:user})
      }
    }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
  }
});

app.post("/branch-login", upload.none(), async (req, res) => {
  try {
    const { mobile,password,username,type,code } = req.body;
    let uid;
    if (!(mobile && password && username && code)){
      return res.status(400).send({status:400,message:"All input is required",success:false});
    }else{
     const users = await User.find({type:'branch'});
        if(users.length==0){
            uid=1;
        }else{
         uid = users[users.length-1].uid+1;   
        }
    encryptedPassword = await bcrypt.hash(password, 10);
    let user = await User.findOne({ mobile:mobile,type:'branch'});
    console.log(user);
    if (!user) {
        const uid = await User.estimatedDocumentCount()+1;
        encryptedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            uid:uid,
            mobile,
            code,
            username,
            password: encryptedPassword,
            type:'branch',
    });
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
        sessionVar = req.session;
        sessionVar.userdetail = user;
        sessionVar.save();
      if (user.role == 'admin') {
        // res.render('/admin/dashbord');
        res.status(200).json({status:200,message:"Admin logged-in",success:true,data:user})
      } else {
        // res.render('/user/dashbord');
        res.status(200).json({status:200,message:"User logged-in",success:true,data:user})
      }
    }   
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
  }
});

app.get("/welcome",auth, async(req, res) => {
  res.status(200).send("Welcome USER");
});

app.get("/tandc",upload.none(), async (req,res)=>{
   try{
       const tandc = "Terms and conditions will be added here!";
       res.status(200).json({status:200,message:"Terms & Conditions",success:true,data:tandc});
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/upload-screenshot",upload.single('image'),async(req,res)=>{
    try{
        const {uid} = req.body;
        const user = await User.findOne({uid});
        if(req.file){
            const pathName = req.file.path.slice(31);
            const path = BASE+pathName;
            const file = req.file;
            await User.updateOne({uid},{$set:{file:{name:req.file.filename,path:pathName}}});
            res.status(201).json({status:201,message:"Screenshot uploaded",file,path,success:true});
        }else{
            res.status(400).json({status:400,message:"Image not received",success:false,data:null});
        }
    }catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
    }
});

app.post("/profile",upload.none(),async(req,res)=>{
   try{
       const {uid} = req.body;
       const user = await User.findOne({uid}).exec();
       if(!user){
           res.status(400).json({status:400,message:"Invalid UID",success:false,data:null});
       }else{
           res.status(200).json({status:200,message:"User found",success:true,data:user});
       }
   } catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/notifications", upload.none(), async(req,res)=>{
    try{
        const uid = req.body.uid;
        const data = await Notifications.find({uid}).exec();
        if(data.length < 1){
            res.status(400).json({status:400,message:"No notifications added.",success:false,data:null});
        }
        else{
            res.status(200).json({status:200,message:"Notifications", success:true,data:data});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
    }
});

app.post("/invoices", upload.none(),async(req,res)=>{
   try{
       const uid = req.body.uid;
       const invoices = await Invoice.find({uid}).exec();
       if(invoices.length<1){
           res.status(400).json({status:400,message:"No invoice for this user",success:false,data:null});
       }else{
           res.status(200).json({status:200,message:"Invoices",success:true,data:invoices});
       }
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/tasks",upload.none(),async (req,res)=>{
   try{
       const uid = req.body.uid;
       const tasks = await Task.find({uid}).exec();
       if(tasks.length<1){
           res.status(400).json({status:400,message:"No task assigned to this user",success:false,data:null});
       }else{
           res.status(200).json({status:200,message:"Tasks",success:true,data:tasks});
       }
   }catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/target",upload.none(),async (req,res)=>{
   try{
       const uid = req.body.uid;
       const target = await Target.find({uid}).exec();
       if(target.length<1){
           res.status(400).json({status:400,message:"No target assigned to this user",success:false,data:null});
       }else{
           res.status(200).json({status:200,message:"target",success:true,data:target});
       }
   }catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});



app.get("/offers", upload.none(), async(req,res)=>{
   try{
       const offers = await Offer.find({});
       if(offers.length<1){
           res.status(400).json({status:400,message:"No offers live",success:false,data:null});
       }
       else{
          res.status(200).json({status:200,message:"Valid Offers",success:true,data:offers});
       }
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.get("/leaderboard",upload.none(),async(req,res)=>{
    try{
        const leaderboard = await User.find({}).select("username position").skip().limit(50);
        let pos=1;
        leaderboard.forEach(function(user){
            user.position=pos;
            pos+=1;
        })
        if(leaderboard.length<1){
            res.status(400).json({status:400,message:"Leaderboard empty",success:false,data:null});
        }
        else{
            res.status(200).json({status:200,message:"Leaderboard",success:true,data:leaderboard});
        }
    }catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
    }
});

app.post("/reports",upload.none(),async(req,res)=>{
    try{
        const {uid} = req.body;
        const reports = await Report.find({uid});
        if(reports.length<1){
            res.status(400).json({status:400,message:"No report found",success:false,data:null});
        }
        else{
            res.status(200).json({status:200,message:"Reports",success:true,data:reports});
        }
    }catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
    }
});

app.get("/contact-branch", upload.none(),async(req,res)=>{
   try{
       let contact = '+'+91+'-'+2345432321;
       let mail = "branchofc-instachamp@gmail.com";
       let name = "indore";
       res.status(200).json({status:200,message:"Contact details",success:true,data:{name,contact,mail}});
   } catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/upload-profile-image",upload.single("profile"), async(req,res)=>{
   try{
       const {uid} = req.body;
       if(req.file){
            const pathName = req.file.path.slice(31);
            const image_name = req.file.filename;
            await User.updateOne({uid},{$set:{profile_image:{name:image_name,path:BASE+pathName}}});
            res.status(201).json({status:201,message:"Profile image updated",success:true,details:{uid:uid,file:req.file.filename,path:BASE+pathName}});
       }else{
           res.status(400).json({status:400,message:"Image not found",success:false,data:null});
       }
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/change-password",upload.none(), async(req,res)=>{
   try{
       const {uid,new_password} = req.body;
       const user = await User.findOne({uid});
       if(!user){
           res.status(400).json({status:400,message:"Invalid UID",success:false,data:null});
       }else{
           encryptedPassword = await bcrypt.hash(new_password, 10);
           const data = await User.updateOne({uid},{$set:{password:encryptedPassword}});
           res.status(201).json({status:201,message:"Password Updated",success:true,data:data});
       }
   } catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/kyc-status",upload.none(), async(req,res)=>{
   try{
       const {uid} = req.body;
       const user = await User.findOne({uid});
       if(!user){
           res.status(400).json({status:400,message:"Invalid UID", success:false, data:null});
       }else{
           res.status(200).json({status:200,message:{status:user.kyc.status,image_path:user.kyc.path},success:true});
       }
   } catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});


app.post("/kyc-apply",upload.single("kyc"),async(req,res)=>{
   try{
       const {uid} = req.body;
       if(req.file){
            const pathName = req.file.path.slice(31);
            const apply = await User.updateOne({uid},{$set:{kyc:{status:"applied",path:BASE+pathName}}});
            res.status(201).json({status:201,message:"Applied for KYC",success:true,data:apply});
       }else{
           res.status(400).json({status:400,message:"Image not received",success:false,data:null});
       }
   } catch(err){
        console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/profile-edit",upload.none(),async(req,res)=>{
   try{
       const {uid,name,mobile,password} = req.body;
       const user = await User.findOne({uid});
       if(!user){
           res.status(400).json({status:400,message:"Invalid UID", success:false, data:null});
       }else{
        encryptedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({uid},{$set:{name:name,mobile:mobile,password:encryptedPassword}});
        const new_user = await User.find({uid});
        res.status(201).json({status:201,message:"User details updated",success:true,data:new_user});
       }
   } catch(err){
        console.log(err);
        res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

app.post("/token-update",upload.none(), async(req,res)=>{
   try{
       let {uid,hsn_token} = req.body;
       let user = await User.findOne({uid});
       if(!user){
           res.status(400).json({status:400,message:"Invalid uid", success:false});
       }else{
           const data = await User.updateOne({uid},{$set:{hsn_token:hsn_token}});
           const user = await User.findOne({uid});
           res.status(201).json({status:201,message:"token updated",success:true,data:user});
       }
       
   }catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false});
   }
});

app.post("/wallet-add", upload.none(),async(req,res)=>{
    try{
        const {uid,amount} = req.body;
        let user = await User.findOne({uid});
        let wallet = Number(user.wallet);
        if(!user){
            res.status(400).json({status:400,message:"Invalid uid",success:false});
        }else{
            wallet += Number(amount);
            await User.updateOne({uid},{$set:{wallet:wallet}});
            let user = await User.findOne({uid});
            res.status(201).json({status:201,message:"Amount credited",success:true,data:user});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({status:500,message:"Internal server error", success:false});
    }
});

app.post("/wallet-withdraw", upload.none(),async(req,res)=>{
    try{
        const {uid,amount} = req.body;
        let user = await User.findOne({uid});
        let wallet = Number(user.wallet);
        if(!user){
            res.status(400).json({status:400,message:"Invalid uid",success:false});
        }else{
            wallet -= amount
            await User.updateOne({uid},{$set:{wallet:wallet}});
            let user = await User.findOne({uid});
            res.status(201).json({status:201,message:"Amount Debited",success:true,data:user});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({status:500,message:"Internal server error", success:false});
    }
});

app.get("/plans", upload.none(), async(req,res)=>{
   try{
       const plans = await Plan.find({});
       if(plans.lenght<1){
           res.status(400).json({status:400,message:"No plan data found",success:false});
       }else{
           res.status(200).json({status:200,message:"Available Plans",success:true,data:plans});
       }
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error", success:false});
   }
});

app.get("/earnings",upload.none(),async (req,res)=>{
   try{
       const {uid} = req.query;
       const earndata = await Report.find({uid});
    //   console.log(earndata);
       const result= await Report.aggregate([
        { $match : {uid:Number(uid)}},
        { $group : {_id:1, total_earning:{$sum:"$earning"}}}
    ]);
    
    // const all_time_earning = result[0].total_earning;
    console.log(result);
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error", success:false});
   }
});

module.exports = app;
