var express = require('express');
const app = require('./users');
var path = require('path');

var router = express.Router();
const User = require("../model/user");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
var multer = require('multer');
const jwt = require("jsonwebtoken");
// const path = require('path');
// var uploads = multer({ storage: storage });
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/test/'));
    }, filename: (req, file, cb) => {
        cb(null, Date.now() + "img" + path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage });
const Report = require("../model/report");
const Invoice = require("../model/invoice");
const Task = require("../model/task");
const Plan = require("../model/plan");
const Employee = require("../model/employee");
const SocialTask = require("../model/socialtask");
const Admin = require("../model/adminregistration");
const Demo = require("../model/demo");
const Offer = require("../model/offer");
const Certificate = require("../model/certificate");
const Franchisee = require("../model/franchisee");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('superadmin/login', { title: 'superadmin login' });
});


app.post('/superadmin-register', async function (req, res, next) {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        if (!(email && password)) {
            return res.status(400).send("All input is required");
        }
        const user = await User.findOne({ email });

        // if (user) {
        //   return res.status(400).json("User already exists.");
        // }

        encryptedPassword = await bcrypt.hash(password, 10);
        const uid = await User.estimatedDocumentCount() + 1;
        const new_user = await User.create({
            uid,
            // first_name,
            // last_name,
            role: "superadmin",
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


router.get("/add-user", async function (req, res) {
    try {
        const users = await User.find({ role: "user" });

        console.log(users)
        res.render("superadmin/adduser", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.post('/add-users', async function (req, res, next) {
  try {
    const { username, password , mobile } = req.body;
    if (!(username && password && mobile )) {
      return res.status(400).send("All input is required");
    }
    const user = await User.findOne({ username });
   
    encryptedPassword = await bcrypt.hash(password, 10);
    const uid = await User.estimatedDocumentCount()+1;
    const new_user = await User.create({
         uid,
         username,
         mobile,
         password: encryptedPassword,
    });
       console.log(user)
   res.redirect("/superadmin-login/add-user");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
});


router.get("/user-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user" });

        console.log(users)
        res.render("superadmin/listuser", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/user-edit/:userID", async function (req, res) {
    try {
        const uid = req.params.userID;
        const user = await User.findOne({ uid });
        res.render("superadmin/edituser", { user: user, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.post("/user-edit/:userID", async function (req, res) {
    try {
        const uid = req.params.userID;
        let user = await User.findOne({ uid });

        let { username, mobile } = req.body;
        
        const data = await User.updateOne({ uid }, { $set: { username: username, mobile: mobile} }).exec();
        res.redirect("/superadmin-login/user-list/");
        //   res.render("admin/edituser",{user:user,baseURL:"http://addas.co.in:7000"});
    } catch (err) {
        console.log(err);
    }
});

router.get("/user-delete/:userID", async function (req, res) {
    try {
        const uid = req.params.userID;
        await User.deleteOne({ uid });
        res.redirect("/superadmin-login/user-list");
    } catch (err) {
        console.log(err);
    }
});

//primeuserlist 
router.get("/primeuser-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user", type: "prime" });

        console.log(users)

        res.render("superadmin/primeuserlist", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

//verify user 
router.get("/verifyuser-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user" });

        console.log(users)
        res.render("superadmin/verifyaproveuser", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get('/update-status/:uid', async function (req, res, next) {

    let uid = req.params.uid
    console.log(uid);

    let user = await User.findOne({ uid: uid })
    console.log(user);
 
    if (user.statuss === "Notapproved") {
        user.statuss = "Approved"
    } else {
        user.statuss = "Notapproved"
    }

    console.log(user.statuss);

    await user.save().then(result => {
        res.send(result)
     res.redirect("/superadmin-login/verifyuser-list");
    })

});



//Kyc verification
router.get("/kycverification-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user" });

        console.log(users)
        res.render("superadmin/kycverification", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


//verify payment screenshot
router.get("/paymentuser-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user" });

        console.log(users)
        res.render("superadmin/verifyscreenshot", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


app.post("/superadmin-login", async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
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
                            res.render("superadmin/dashboard");
                        }
                    })
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
});

router.get("/user-report/:uid", async function (req, res) {
    try {
        let uid = req.params.uid;
        const reports = await Report.find({ uid: uid });
        res.render("superadmin/reportform", {
            uid: uid, users: reports,

            baseURL: "http://addas.co.in:7000"
        });
    } catch (err) {
        console.log(err);
    }
});


router.get("/report-user-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user" });


        console.log(users)

        res.render("superadmin/userlist", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.post("/user-add-report/:uid", async (req, res) => {
    try {
        const sno = await Report.estimatedDocumentCount() + 1;
        let uid = req.params.uid;
        const { date, work, task, earning } = req.body;

        if (!uid || !date || !work || !task || !earning) {
            res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const user = await User.findOne({ uid, role: 'user' });

        if (!user) {
            res.status(400).json({ status: 400, message: "Invalid UID", success: false });
        }
        else {
            const data = await Report.create({
                uid,
                date: new Date(date),
                work,
                task,
                earning
            });
            res.redirect("/superadmin-login/user-report/" + uid);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/report-delete/:uid", async function (req, res) {
    try {
        const uid = req.params.uid;
        await Report.deleteOne({ uid });
        res.redirect("/superadmin-login/report-user-list");
    } catch (err) {
        console.log(err);
    }
});

//invoice function
router.get("/invoice-user-list", async function (req, res) {
   try {
        const users = await User.find({ role: "user" });
    res.render("superadmin/invoiceuserlist", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/user-invoice/:uid", async function (req, res) {
    try {
        let uid = req.params.uid;
        const invoices = await Invoice.find({ uid: uid });
        console.log(invoices)
        res.render("superadmin/invoiceform", { uid: uid, invoices: invoices, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.post("/add-invoice/:uid", async (req, res) => {
    try {
        const sno = await Invoice.estimatedDocumentCount() + 1;
        let uid = req.params.uid
        console.log(req.body)
        const { invoicedata, date, Re_number, gst, quantity, amount, buyer_name, paid_on, product, sub_total, total_price } = req.body;

        if (!uid || !invoicedata || !date || !Re_number || !quantity || !gst || !amount || !buyer_name || !paid_on || !product || !sub_total || !total_price) {
            return res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const user = await User.findOne({ uid, role: 'user' });
        if (!user) {
            return res.status(400).json({ status: 400, message: "Invalid UID", success: false });
        }
        else {
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
            return res.redirect("/superadmin-login/user-invoice/" + uid)
            //   return res.status(201).json({status:201,message:"Invoice added",success:true,data:data});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/edit-invoice/:uid", async function (req, res) {
    try {
        let uid = req.params.uid;
        const invoice = await Invoice.find({ uid: uid });
        
        res.render("superadmin/editinvoice", { uid: uid, invoice: invoice, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/invoice-delete/:sno", async function (req, res) {
    try {
        const sno = req.params.sno;
        await Invoice.deleteOne({ sno: sno });
        res.redirect("/superadmin-login/user-invoice/" + sno);
    } catch (err) {
        console.log(err);
    }
});

//task function
router.get("/task-user-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user", type: "normal" });

        console.log(users)

        res.render("superadmin/taskuserlist", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/user-task/:uid", async function (req, res) {

    try {
        let uid = req.params.uid;
        const tasks = await Task.find({ uid: uid });
        console.log(tasks)
        res.render("superadmin/taskform", { uid: uid, tasks: tasks, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.post("/assign-task/:uid", async (req, res) => {
    try {
        const sno = await Task.estimatedDocumentCount() + 1;
        let uid = req.params.uid
        //   const {uid,status,taskdata} = req.body;

        let status = req.body.Status
        let taskdata = req.body.taskdata

        //   console.log(req.body)
        if (!uid || !taskdata || !status) {
            return res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const user = await User.findOne({ uid, role: 'user' });
        if (!user) {
            return res.status(400).json({ status: 400, message: "Invalid UID", success: false });
        }
        if (status.length < 1) {
            status = 'pending';
        }
        else {
            const data = await Task.create({
                sno,
                uid,
                taskdata,
                status,
            })
            res.redirect("/superadmin-login/user-task/" + uid);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

//social task  function
router.get("/social-task", async function (req, res) {
    try {
        const socialtasks = await SocialTask.find();

        res.render("superadmin/socialtask", { socialtask: socialtasks, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

var uploadMultiple = upload.fields([{ name: 'poster', maxCount: 1 }])
router.post("/socialtask-insert", uploadMultiple, async (req, res) => {
    try {
        const sno = await SocialTask.estimatedDocumentCount() + 1;
        const file = req.files;
        console.log(file);
        let poster = file["poster"][0]["path"].slice(31)
        console.log(poster)
        const { task, link } = req.body;

        if (!(task, poster, link)) {
            res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const socialtask = await SocialTask.find();
        if (!socialtask) {
            res.status(400).json({ status: 400, message: "socialtask already exists", success: false });
        }
        else {
            const data = await SocialTask.create({
                sno,
                task,
                poster,
                link
            })
            res.redirect("/superadmin-login/social-task");

        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/socialtask-delete/:sno", async function (req, res) {
    try {
        const sno = req.params.sno;
        await SocialTask.deleteOne({ sno: sno });

        res.redirect("/superadmin-login/social-task/");
    } catch (err) {
        console.log(err);
    }
});
//api 
router.get("/social-tasks", async function (req, res) {
    try {
        let socialtasks = await SocialTask.find();
        console.log(socialtasks);
        socialtasks.forEach(function (item) {
            item.poster = "http://addas.co.in:7000" + item.poster;
        })
        console.log(socialtasks);
        res.status(201).json({ status: 201, message: "socialtasks data inserted", success: true, socialtasks: socialtasks });
    } catch (err) {
        console.log(err);
    }
});


//demo function

router.get("/user-demo", async function (req, res) {
    try {
        const Demos = await Demo.find();
        res.render("superadmin/demo", { demo: Demos, baseURL: "http://addas.co.in:7000" });
        console.log(Demos);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({})
    }
});

var storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/test/'));
    }, filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
var upload2 = multer({ storage: storage2 });

var uploadMultiple = upload2.fields([{ name: 'demo', maxCount: 1 }])
router.post("/demo-insert", uploadMultiple, async (req, res) => {
    try {
        const sno = await Demo.estimatedDocumentCount() + 1;
        const file = req.files;
        console.log(file);
        let video = file["demo"][0]["path"].slice(31)
        console.log(video);
        const {description} = req.body;

        if (!(video,description)) {
            res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const demo = await Demo.find();
        if (!demo) {
            res.status(400).json({ status: 400, message: "Demo already exists", success: false });
        }
        else {
            const data = await Demo.create({
                sno,
                video,
                description
            })
            res.redirect("/superadmin-login/user-demo");

        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/demo-delete/:sno", async function (req, res) {
    try {
        const sno = req.params.sno;
        await Demo.deleteOne({ sno: sno });
        res.redirect("/superadmin-login/demo/" + sno);
    } catch (err) {
        console.log(err);
    }
});


//api demo
router.get("/user-demos", async function (req, res) {
    try {
        let demos = await Demo.find();
        demos.forEach(function (item) {
            item.video = "http://addas.co.in:7000/" + item.video;
        })
        res.status(201).json({ status: 201, message: "Demo data inserted", success: true, Demos: demos });
        console.log(Demos);
    }
    catch (err) {
        console.log(err);
    }
});



router.get("/users-north", upload.none(), async (req, res) => {
    try {
        const nusers = await User.find({ location: 'north' });
        if (nusers.length < 1) {
            res.status(400).json({ status: 400, message: "No users from north", success: false });
        } else {
            res.status(200).json({ status: 200, message: "Users from north", success: true, data: nusers });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false });
    }
});

router.get("/users-south", upload.none(), async (req, res) => {
    try {
        const susers = await User.find({ location: 'south' });
        if (susers.length < 1) {
            res.status(400).json({ status: 400, message: "No users from south", success: false });
        } else {
            res.status(200).json({ status: 200, message: "Users from south", success: true, data: susers });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false });
    }
});

router.get("/users-prime", upload.none(), async (req, res) => {
    try {
        const primeusers = await User.find({ type: 'prime' });
        if (primeusers.length < 1) {
            res.status(400).json({ status: 400, message: "No prime user", success: false });
        } else {
            res.status(200).json({ status: 200, message: "Prime users", success: true, data: primeusers });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false });
    }
});



//plan function

router.get("/user-plan", async function (req, res) {
    try {
        const plans = await Plan.find();
        res.render("superadmin/planform", { plan: plans, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


router.post("/plan-insert", async (req, res) => {
    try {
        const sno = await Plan.estimatedDocumentCount() + 1;
        const { code, tier, amount, name } = req.body;

        if (!(code, tier, amount, name)) {
            res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const plan = await Plan.findOne({ code });
        if (!code) {
            res.status(400).json({ status: 400, message: "Plan already exists", success: false });
        }
        else {
            const data = await Plan.create({
                sno,
                code,
                tier,
                amount,
                name
            })
            res.redirect("/superadmin-login/user-plan");

        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/plan-delete/:id", async function (req, res) {
    try {
        const id = req.params.id;
        await Plan.deleteOne({ _id: id });

        res.redirect("/superadmin-login/user-plan/");
    } catch (err) {
        console.log(err);
    }
});
router.get("/plan-edit/:id", async function (req, res) {
    try {
        const id = req.params.id;
        const Plan = await User.findOne({ _id: id });
        res.render("/superadmin-login/editplan/", { user: user, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.post("/plan-edit/:id", async function (req, res) {
    try {
        const id = req.params.id;
        let plan = await Plan.findOne({ _id: id });

        let { code, tier, amount, name } = req.body;

        const data = await Plan.updateOne({ id }, { $set: { code: code, tier: tier, amount: amount, name: name } }).exec();
        res.redirect("/superadmin-login/user-list/");
        //   res.render("admin/edituser",{user:user,baseURL:"http://addas.co.in:7000"});
    } catch (err) {
        console.log(err);
    }
});


//api
router.get("/user-plans", async function (req, res) {
    try {
        const plans = await Plan.find();
        res.status(201).json({ status: 201, message: "plans data inserted", success: true, plans: plans });
    } catch (err) {
        console.log(err);
    }
});

//employee list 
router.get("/get-employeelist", async function (req, res) {
    try {
        const employees = await Employee.find( { location: "South" });
        res.render("superadmin/employeelist", { employee: employees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/get-employee", async function (req, res) {
    try {
        const employees = await Employee.find();
        res.render("superadmin/employeeform", { employee: employees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


var uploadMultiple = upload.fields([{ name: 'passport_photo', maxCount: 1 }])
router.post("/add-employee", uploadMultiple, async (req, res) => {
    try {
        const sno = await Employee.estimatedDocumentCount() + 1;
        const file = req.files;
        console.log(file);
        let passport_photo = file["passport_photo"][0]["path"].slice(31)
        console.log(passport_photo)
        const { name, dob, email, pincode, city, mobile, state, father_name, gender, martial_status, address, pan_card, aadhar_card, position, salary, joining_date, salary_date, location } = req.body;
        // await Employee.remove()
        //     return    res.send("done deleting");

        if (!(name || !mobile || !father_name || !email || !gender || !dob || !martial_status || !address || !pincode || !city || !state || !pan_card || !aadhar_card || !passport_photo || !position || !salary || !joining_date || !salary_date || !location)) {
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
                location
            })
            res.redirect("/superadmin-login/get-employee");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/edit-employee/:id", async function (req, res) {
    try {
        let id = req.params.id;
        const employee = await Employee.find({ _id: id });
      res.render("superadmin/editemployee", {_id: id, employee: employee, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/employee-delete/:id", async function (req, res) {
    try {
        const id = req.params.id;
        await Employee.deleteOne({ _id: id });
        res.redirect("/superadmin-login/get-employeelist/");
    } catch (err) {
        console.log(err);
    }
});

//north
router.get("/get-employeelistnorth", async function (req, res) {
    try {
        const employees = await Employee.find({ location: "North" });
        res.render("superadmin/North/employeelist", { employee: employees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/get-employeenorth", async function (req, res) {
    try {
        const employees = await Employee.find();
        res.render("superadmin/North/employeeform", { employee: employees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


var uploadMultiple = upload.fields([{ name: 'passport_photo', maxCount: 1 }])
router.post("/add-employee", uploadMultiple, async (req, res) => {
    try {
        const sno = await Employee.estimatedDocumentCount() + 1;
        const file = req.files;
        console.log(file);
        let passport_photo = file["passport_photo"][0]["path"].slice(31)
        console.log(passport_photo)
        const { name, dob, email, pincode, city, mobile, state, father_name, gender, martial_status, address, pan_card, aadhar_card, position, salary, joining_date, salary_date, location } = req.body;
        // await Employee.remove()
        //     return    res.send("done deleting");

        if (!(name || !mobile || !father_name || !email || !gender || !dob || !martial_status || !address || !pincode || !city || !state || !pan_card || !aadhar_card || !passport_photo || !position || !salary || !joining_date || !salary_date || !location)) {
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
                location
            })
            res.redirect("/superadmin-login/get-employee");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/employeenorth-delete/:id", async function (req, res) {
    try {
        const id = req.params.id;
        await Employee.deleteOne({ _id: id });
        res.redirect("/superadmin-login/get-employeelistnorth/");
    } catch (err) {
        console.log(err);
    }
});




/* GET admin registration page. */
router.get("/Registration", async function (req, res) {
    try {
        const admins = await Admin.find();
        res.render("superadmin/adminregistration", { adminregistration: admins, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

var uploadMultiple = upload.fields([
    { name: 'kyc_document', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan_card', maxCount: 1 }
])

router.post("/admin-insert", uploadMultiple, async (req, res) => {

    let existing_user;

    /**
     * Checking if the mobile number is already used
     */
    existing_user = await Admin.findOne({ phone: req.body.phone }).exec()

    if (existing_user) {
        console.log("Hi" + existing_user);
        return res.status(409).send({
            response: false,
            data: "User with same mobile number exist",
            code: 4091
        })
    }

    /**
     * Checking if the email is already used
     */
    existing_user = await Admin.findOne({ email: req.body.email }).exec()

    if (existing_user) {
        return res.status(409).send({
            response: false,
            data: "User with same email ID exist",
            code: 4092
        })
    }


    try {
        const sno = await Admin.estimatedDocumentCount() + 1;
        const file = req.files;

        let kyc_document = file["kyc_document"][0]["path"].slice(31)
        let aadhar = file["aadhar"][0]["path"].slice(31)
        let pan_card = file["pan_card"][0]["path"].slice(31)
        console.log(kyc_document, aadhar, pan_card)
        const { fullname, dob, email, phone, region, branch, password } = req.body;

        if (!kyc_document || !aadhar || !pan_card || !fullname || !dob || !password || !email || !phone || !region || !branch) {
            return res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }

        else {
            const encryptedPassword = await bcrypt.hash(password, 10);
            const data = await Admin.create({
                kyc_document,
                aadhar,
                pan_card,
                fullname,
                dob,
                email,
                password: encryptedPassword,
                phone,
                region,
                branch
            })
            res.redirect("/superadmin-login/Adminloginpage");

        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});


router.get("/Registrationlist", async function (req, res) {
    try {
        const admins = await Admin.find({ region: "south" });

        res.render("superadmin/adminRegistrationlist", { adminregistration: admins, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/Registrationlistnorth", async function (req, res) {
    try {
        const admins = await Admin.find({ region: "north" });

        res.render("superadmin/North/adminRegistrationlist", { adminregistration: admins, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


//login 
router.get("/Adminloginpage", async function (req, res) {
    try {
        const admins = await Admin.find();
        res.render("superadmin/adminlogin", { adminregistration: admins, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

var uploadMultiple = upload.fields([{ name: 'photo', maxCount: 1 },
{ name: 'ophoto', maxCount: 1 }, { name: 'Rdocument', maxCount: 1 }])
router.post("/admin", uploadMultiple, async (req, res) => {
    try {
        const sno = await Admin.estimatedDocumentCount() + 1;
        const file = req.files;
        const { email, password, faddress } = req.body;

        const photo = file["photo"][0]["path"].slice(31)
        const ophoto = file["ophoto"][0]["path"].slice(31)
        const Rdocument = file["Rdocument"][0]["path"].slice(31)

        if (!faddress || !photo || !ophoto || !Rdocument || !email || !password) {
            return res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        else {

            const encryptedPassword = await bcrypt.hash(password, 10);
            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res.status(400).json({ status: 400, message: "No admin found", success: false });
            } else {
                bcrypt.compare(password, admin.password, function (err, result) {
                    console.log("password match: " + result);
                    if (result == true) {


                        const final = Admin.findOneAndUpdate({ email: email }, { $set: req.body }, { new: true }, function (err, user) {

                            if (err) {
                                res.send(err);
                                return;
                            }

                            if (!user) {
                                res.status(404).send({
                                    success: false,
                                    message: "user not found"
                                });
                            } else {

                                user.photo = photo;
                                user.ophoto = ophoto;
                                user.Rdocument = Rdocument;
                                user.faddress = faddress;
                                user.email = email;
                                user.password = encryptedPassword;


                                user.save(function (err) {
                                    if (err) {
                                        res.send(err);
                                        return;
                                    }

                                });
                            }
                        });


                        console.log(final);
                        return res.redirect("../admin-login");
                    } else {
                        console.log("Invalid password");
                        return res.redirect("/Adminloginpage", prompt("Invalid password"));
                    }
                })

            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});
router.get("/loginlist", async function (req, res) {
    try {
        const admins = await Admin.find({ region: "south" });
        res.render("superadmin/adminloginlist", { adminregistration: admins, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/loginlistnorth", async function (req, res) {
    try {
        const admins = await Admin.find({ region: "north" });
        res.render("superadmin/North/adminloginlist", { adminregistration: admins, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

// router.get("/loginlist-delete/:sno", async function(req,res){
//   try{
//       const sno = req.params.sno;
//       await Admin.deleteOne({sno:sno});
//       res.redirect("/superadmin-login/adminloginlist/"+sno);
//   } catch(err){
//       console.log(err);
//   }
// });


//offer function
router.get("/user-offer", async function (req, res) {
    try {
        const Offers = await Offer.find();
        res.render("superadmin/offer", { offer: Offers, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.post("/offer-insert", async (req, res) => {
    try {
        const sno = await Offer.estimatedDocumentCount() + 1;
        console.log(sno);
        const { code, offerdata, validtill, status } = req.body;
        console.log(req.body);
        console.log(code, offerdata, validtill, status);

        if (!(code || offerdata || validtill || status)) {
            res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        } else {
            const offer = await Offer.findOne({ code });
            if (!code) {
                res.status(400).json({ status: 400, message: "offer already exists", success: false });
            }
            else {
                const data = await Offer.create({
                    sno,
                    code,
                    offerdata,
                    validtill,
                    status
                })
                res.redirect("/superadmin-login/user-offer");

            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/offer-delete/:sno", async function (req, res) {
    try {
        const sno = req.params.sno;
        await Offer.deleteOne({ sno: sno });
        res.redirect("/superadmin-login/user-offer/" + sno);
    } catch (err) {
        console.log(err);
    }
});

router.get("/offer-edit/:sno", async function (req, res) {
    try {
        const sno = req.params.sno;
        const offer = await Offer.findOne({ sno });
        res.render("superadmin/editoffer", { offer: offer, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});
//api
router.get("/user-offers", async function (req, res) {
    try {
        const Offers = await Offer.find();
        res.status(201).json({ status: 201, message: "Offer data inserted", success: true, Offers: Offers });
    } catch (err) {
        console.log(err);
    }
});


//certificate function
router.get("/certificate-user-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user", type: "prime" });
        console.log(users);
        res.render("superadmin/certificatelistuser", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

router.get("/user-certificate/:uid", async function (req, res) {
    try {
        let uid = req.params.uid;
        const certificate = await Certificate.find({ uid: uid });

        res.render("superadmin/certificateform", { uid: uid, certificate: certificate, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});

var storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/certificate/'));
    }, filename: (req, file, cb) => {
        cb(null, Date.now() + "pdf" + path.extname(file.originalname));
    }
});
var upload3 = multer({ storage: storage3 });

var uploadMultiple = upload3.fields([{ name: 'certificate', maxCount: 1 }])
router.post("/add-certificates", uploadMultiple, async (req, res) => {
    try {
        let base = "http://addas.co.in:7000";
        const sno = await Certificate.estimatedDocumentCount() + 1;
        let { uid } = req.query;
        const file = req.files;
        let certificate = base + file["certificate"][0]["path"].slice(31);
        console.log(uid, certificate);
        if (!uid || !certificate) {
            return res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const user = await User.findOne({ uid, role: 'user' });
        if (!user) {
            return res.status(400).json({ status: 400, message: "Invalid UID", success: false });
        }
        else {
            const data = await Certificate.create({
                sno,
                uid,
                certificate
            })
            // return res.redirect("/superadmin-login/user-certificate/" + uid);
            res.status(201).json({ status: 201, message: "certificate added", success: true, data: data });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});



var uploadMultiple = upload3.fields([{ name: 'certificate', maxCount: 1 }])
router.post("/add-certificates", uploadMultiple, async (req, res) => {
    try {
        const sno = await Certificate.estimatedDocumentCount() + 1;
        let uid = req.params.uid;
        const file = req.files;
        console.log(req.body);
        let certificate = file["certificate"][0]["path"].slice(31);
        console.log(certificate);

        if (!uid || !certificate) {
            return res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }
        const user = await User.findOne({ uid, role: 'user' });
        if (!user) {
            return res.status(400).json({ status: 400, message: "Invalid UID", success: false });
        }
        else {
            const data = await Certificate.create({
                sno,
                uid,
                certificate
            })
            return res.status(201).json({ status: 201, message: "certificate added", success: true, data: data });

        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});




router.get("/certificate-delete/:sno", async function (req, res) {
    try {
        const sno = req.params.sno;
        await Certificate.deleteOne({ sno: sno });
        res.redirect("/superadmin-login/user-certificate/" + sno);
    } catch (err) {
        console.log(err);
    }
});

//add franchisee 
router.get("/franchisee", async function (req, res) {
    try {
        // let tmp = await Franchisee.find({ region: "North" }).exec()
        // console.log(tmp);
        const franchisees = await Franchisee.find();
        res.render("superadmin/addfranchisee", { franchisee: Franchisee, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});



router.post("/add-franchisee", async (req, res) => {
    try {

        const sno = await Franchisee.estimatedDocumentCount() + 1;
        const { name, email, password, region, vaildtill } = req.body;

        if (!(name, email, password, region, vaildtill)) {
            res.status(400).json({ status: 400, message: "Insufficient input", success: false });
        }

        const franchisee = await Franchisee.findOne({ email });

        if (!email) {
            res.status(400).json({ status: 400, message: "Franchisee already exists", success: false });
        }
        else {

            let code = sno < 10 ? "FRAN220" + sno.toString() : "FRAN22" + sno.toString()

            const data = await Franchisee.create({
                code: code,
                name: name,
                email: email,
                password: password,
                region: region,
                vaildtill: vaildtill
            })
            res.redirect("/superadmin/franchisee");

        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal server error", success: false, data: err });
    }
});

router.get("/franchiseelist", async function (req, res) {
    try {
        let tmp = await Franchisee.find({ region: "North" }).exec()
        console.log(tmp);
        const franchisees = await Franchisee.find({ region: "North" });
        res.render("superadmin/North/listfranchiseenorth", { franchisee: franchisees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});
router.get("/franchiseelist-delete/:code", async function (req, res) {
    try {
        const code = req.params.code;
        await Franchisee.deleteOne({ code: code });
        res.redirect("/superadmin-login/North/listfranchiseenorth/" + code);
    } catch (err) {
        console.log(err);
    }
});

router.get("/franchiseelists", async function (req, res) {
    try {
       let tmp = await Franchisee.find({ region: "South" }).exec()
       console.log(tmp);
       const franchisees = await Franchisee.find({ region: "South" });
       res.render("superadmin/listfranchiseesouth", { franchisee: franchisees, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


//waleet user list
router.get("/wallet-user-list", async function (req, res) {
    try {
        const users = await User.find({ role: "user" });
        console.log(users);
        res.render("superadmin/walletuserlist", { users: users, baseURL: "http://addas.co.in:7000" });
    } catch (err) {
        console.log(err);
    }
});


module.exports = router;
