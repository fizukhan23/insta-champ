var express = require('express');
const app = require('./users');
var router = express.Router();
const User = require("../model/user");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
var multer = require('multer');
const jwt = require("jsonwebtoken");
const path = require('path');
var uploads = multer({ storage: storage });
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/asset/'));
  }, filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});
const Task = require("../model/task");
const Invoice = require("../model/invoice");
const Target = require("../model/target");
const Leader = require("../model/leaderboard");
const Report = require("../model/report");
const Plan = require("../model/plan");
const Offer = require("../model/offer");
const Franchisee = require("../model/franchisee");
const Employee = require("../model/employee");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('admin/login', { title: 'admin login' });
});

router.post('/register', async function (req, res, next) {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send("All input is required");
    }
    const franchisee = await Franchisee.findOne({ email });


    encryptedPassword = await bcrypt.hash(password, 10);
    const uid = await Franchisee.estimatedDocumentCount()+1;
    const new_user = await Franchisee.create({
        uid,
    
      role: "admin",
      email: email.toLowerCase(),
      password: encryptedPassword,
    });
    const token = jwt.sign(
      { user_id: new_user._id, email }, 
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    new_user.token = token;
    res.status(201).json({ message: "Creation success", new_user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});



app.post("/admin-login", async function (req, res) {
  try {
    const { email, password, code } = req.body;
    if (!(email && password && code)) {
      console.log("All input is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Invalid Credentials");
    }
    User.findOne({ email }, function (err, foundUser) {
      if (err) {
        console.log(err);
      }
      else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, function (err, result) {
            if (result === true) {
              console.log("Login Success!");
              res.render("admin/dashboard",{baseURL:"http://addas.co.in:7000"});
            }
          })
        }
      }
    })
  } catch (err) {
    console.log(err);
  }
});

router.get("/user-list", async function(req,res){
   try{
      const users = await User.find({role:"user",type:"normal"});
      res.render("admin/listuser",{users:users,baseURL:"http://addas.co.in:7000"});
   } catch(err){
       console.log(err);
   }
});

router.get("/user-edit/:userID",async function(req,res){
   try{
       const uid = req.params.userID;
       const user = await User.findOne({uid});
       res.render("admin/edituser",{user:user,baseURL:"http://addas.co.in:7000"});
   } catch(err){
       console.log(err);
   }
});


router.post("/user-edit/:userID",async function(req,res){
   try{
       const uid = req.params.userID;
       let user = await User.findOne({uid});
       
      let {username,mobile,password} = req.body;
       if(password.length>1){
           password = await bcrypt.hash(password, 10);
       }else{
           password = user.password;
       }
       const data = await User.updateOne({uid},{$set:{username:username,mobile:mobile,password:password}}).exec();
       res.redirect("/admin-login/user-list");
    //   res.render("admin/edituser",{user:user,baseURL:"http://addas.co.in:7000"});
   } catch(err){
       console.log(err);
   }
});

router.get("/user-delete/:userID", async function(req,res){
   try{
       const uid = req.params.userID;
       await User.deleteOne({uid});
       res.redirect("/admin-login/user-list");
   } catch(err){
       console.log(err);
   }
});

router.get("/kyc-verification", async function(req,res){
  try{
      const users = await User.find({role:"user",type:"normal"});
      res.render("admin/kycverification",{users:users,baseURL:"http://addas.co.in:7000"});
   } catch(err){
       console.log(err);
   }
});

router.get("/kyc-verification/:userID",async function(req,res){
  try{
      const uid = req.params.userID;
      const user = await User.findOne({uid});
      console.log(user.kyc);
      res.render("admin/editkyc",{user:user,baseURL:"http://addas.co.in:7000"});
  } catch(err){
      console.log(err);
  }
});

// router.get("/kyc-verification/")

router.post("/")

router.get("/kyc-verification", async function(req,res){
  try{
      const users = await User.find({role:"user",type:"normal"});
      res.render("admin/kycverification",{users:users,baseURL:"http://addas.co.in:7000"});
  } catch(err){
      console.log(err);
  }
});


router.post("/assign-task", async(req,res)=>{
   try{
       const sno = await Task.estimatedDocumentCount()+1;
       const {uid,status,taskdata} = req.body;
       if(!uid || !taskdata){
          return res.status(400).json({status:400,message:"Insufficient input",success:false});
       }
       const user = await User.findOne({uid,role:'user'});
       if(!user){
          return res.status(400).json({status:400,message:"Invalid UID",success:false});
       }
       if(status.length<1){
           status='pending';
       }
       else{
           const data = await Task.create({
               sno,
               uid,
               taskdata,
               status,
           })
          return res.status(201).json({status:201,message:"Task assigned",success:true,data:data});
       }
   } catch(err){
       console.log(err);
      return res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

router.post("/add-invoice", async(req,res)=>{
   try{
       const sno = await Invoice.estimatedDocumentCount()+1;
       const {uid,invoicedata, date,Re_number, gst, quantity, amount,buyer_name,paid_on,product,sub_total,total_price} = req.body;
      
       
       if(!uid || !invoicedata || !date ||!Re_number || !quantity || !gst || !amount || !buyer_name || !paid_on || !product || !sub_total || !total_price ){
          return res.status(400).json({status:400,message:"Insufficient input",success:false});
       }
       const user = await User.findOne({uid,role:'user'});
       if(!user){
          return res.status(400).json({status:400,message:"Invalid UID",success:false});
       }
       else{
           const data = await Invoice.create({
               sno,
               uid,
               invoicedata,
               Re_number,
               date,
               quantity,
               gst,
               amount,
               buyer_name,
               paid_on,
               product,
               sub_total,
               total_price
           })
          return res.status(201).json({status:201,message:"Invoice added",success:true,data:data});
       }
   } catch(err){
       console.log(err);
      return res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

//target api
router.post("/assign-target", async(req,res)=>{
   try{
       const sno = await Target.estimatedDocumentCount()+1;
       const {uid,status,targetdata} = req.body;
       if(!uid || !targetdata){
           res.status(400).json({status:400,message:"Insufficient input",success:false});
       }
       const user = await User.findOne({uid,role:'user'});
       if(!user){
           res.status(400).json({status:400,message:"Invalid UID",success:false});
       }
       if(status.length<1){
           status='pending';
       }
       else{
           const data = await Target.create({
               sno,
               uid,
               targetdata,
               status,
           })
           res.status(201).json({status:201,message:"Target assigned",success:true,data:data});
       }
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});



router.post("/leaderboard-insert", async(req,res)=>{
   try{
       const {pos,uid,name,boarddata} = req.body;
       if(!(uid,pos)){
           res.status(400).json({status:400,message:"Insufficient input",success:false});
       }
       const user = await User.findOne({uid,role:'user'});
       if(!user){
           res.status(400).json({status:400,message:"Invalid UID",success:false});
       }
       else{
          const data = await Leader.updateOne({pos},{$set:{uid:uid,name:user.username,boarddata:boarddata}});
        // const data = await Leader.create({
        //     pos,
        //     uid,
        //     name,
        //     boarddata,
        // })
           res.status(201).json({status:201,message:"Leaderbaord updated at POS:"+pos,success:true,data:data});
       }
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

router.post("/assign-report", async(req,res)=>{
   try{
       const sno = await Report.estimatedDocumentCount()+1;
       const {uid, date, work, task, earning} = req.body;
    //   console.log(req.body)
       console.log(uid);
       console.log(date);
       console.log(work);
       console.log(task);
       console.log(earning);
       
       if(!uid || !date || !work || !task || !earning){
           res.status(400).json({status:400,message:"Insufficient input",success:false});
       }
       const user = await User.findOne({uid,role:'user'});
       if(!user){
           res.status(400).json({status:400,message:"Invalid UID",success:false});
       }
       else{
        const data = await Report.create({
            uid,
            date, 
            work,
            task,
            earning
        })
           res.status(201).json({status:201,message:"Report data inserted",success:true,data:data});
       }
   } catch(err){
       console.log(err);
       res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
   }
});

router.post("/plan-insert", async(req,res)=>{
  try{
      const sno = await Plan.estimatedDocumentCount()+1;
      const {code,tier,amount,name} = req.body;
     
      if(!(code,tier,amount,name)){
          res.status(400).json({status:400,message:"Insufficient input",success:false});
      }
      const plan = await Plan.findOne({code});
      if(!code){
          res.status(400).json({status:400,message:"Plan already exists",success:false});
      }
      else{
        const data = await Plan.create({
            sno,
            code,
            tier,
            amount,
            name
        })
          res.status(201).json({status:201,message:"Plan data inserted",success:true,data:data});
      }
  } catch(err){
      console.log(err);
      res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
  }
});

router.post("/offer-insert", async(req,res)=>{
  try{
      const sno = await Offer.estimatedDocumentCount()+1;
      const {code,offerdata,valid_till} = req.body;
      if(!(code,offerdata,valid_till)){
          res.status(400).json({status:400,message:"Insufficient input",success:false});
      }
      const offer = await Offer.findOne({code});
      if(offer){
          res.status(400).json({status:400,message:"Offer already exists",success:false});
      }
      else{
        const data = await Offer.create({
            sno,
            code,
            offerdata,
            validtill: new Date(valid_till)
        })
          res.status(201).json({status:201,message:"Offer data inserted",success:true,data:data});
      }
  } catch(err){
      console.log(err);
      res.status(500).json({status:500,message:"Internal server error",success:false,data:err});
  }
});
router.get("/user-wallet", async function(req,res){
   try{
      const users = await User.find({role:"user",type:"normal"});
      res.render("admin/wallet",{users:users,baseURL:"http://addas.co.in:7000"}); 
   } catch(err){
       console.log(err);
   }
});
router.get("/user-edit-wallet/:userID",async function(req,res){
   try{
       const uid = req.params.userID;
       const user = await User.findOne({uid});
       res.render("admin/edituserwallet",{user:user,baseURL:"http://addas.co.in:7000"});
   } catch(err){
       console.log(err);
   }
});

router.post("/user-edit-wallet/:userID",async function(req,res){
   try{
       const uid = req.params.userID;
       let user = await User.findOne({uid});
       
      let {username,mobile,wallet} = req.body;
       
       const data = await User.updateOne({uid},{$set:{username:username,mobile:mobile,wallet:wallet}}).exec();
       res.redirect("/admin-login/user-wallet");
    //   res.render("admin/edituser",{user:user,baseURL:"http://addas.co.in:7000"});
   } catch(err){
       console.log(err);
   }
});
router.get("/user-delete-wallet/:userID", async function(req,res){
   try{
       const uid = req.params.userID;
       await User.deleteOne({uid});
       res.redirect("/admin-login/user-wallet");
   } catch(err){
       console.log(err);
   }
});

//employee function


router.get("/get-employeelist", async function (req, res) {
    try {
        const employees = await Employee.find();
        res.render("admin/employeelist", { employee: employees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/get-employee", async function (req, res) {
    try {
        const employees = await Employee.find();
        res.render("admin/employeeform", { employee: employees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});
var storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/test/'));
    }, filename: (req, file, cb) => {
        cb(null, Date.now() + "pdf" + path.extname(file.originalname));
    }
});
var upload1 = multer({ storage: storage1 });

var uploadMultiple = upload1.fields([{ name: 'passport_photo', maxCount: 1 }])
router.post("/add-employee", uploadMultiple, async (req, res) => {
    try {
        const sno = await Employee.estimatedDocumentCount() + 1;
        const file = req.files;
        console.log(file);
        let passport_photo = file["passport_photo"][0]["path"].slice(31)
        console.log(passport_photo)
        const { name, dob, email, pincode, city, mobile, state, father_name, gender, martial_status, address, pan_card, aadhar_card, position, salary, joining_date, salary_date, location, branchcode } = req.body;
        // await Employee.remove()
        //     return    res.send("done deleting");

        if (!(name || !mobile || !father_name || !email || !gender || !dob || !martial_status || !address || !pincode || !city || !state || !pan_card || !aadhar_card || !passport_photo || !position || !salary || !joining_date || !salary_date || !location || !branchcode)) {
            return res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        //  const employee = await User.findOne({ uid, role: 'user' });
        // if (!employee) {
        //     return res.status(400).json({ status: 400, message: "Invalid UID", success: false });
        // }
        else {
            const data = await Employee.create({
                sno,
                name,
                mobile,
                father_name,
                email,
                gender,
                dob,
                martial_status,
                address,
                pincode,
                city,
                state,
                pan_card,
                aadhar_card,
                passport_photo,
                position,
                salary,
                joining_date,
                salary_date,
                location,
                branchcode
            })
            res.redirect("/admin-login/get-employee");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/employee-delete/:id", async function (req, res) {
    try {
        const id = req.params.id;
        await Employee.deleteOne({ _id: id });
        res.redirect("/admin-login/get-employeelist/");
    } catch (err) {
        console.log(err);
    }
});



module.exports = router;
