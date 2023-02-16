const axios = require("axios")
const planeManagementModel = require("../models/planeManagementModel")



//==========================================updateVideos|| only for Admin =====================================================
const uploadVideos = async function (req, res) {
    try {
        let data = req.body
        if(!data){
            return res.status(400).send({status:false,message:"all fields are mandatory"})
        }
        if (isAdmin == true) {
            let savedData = await planeManagementModel.create(data)
            return res.status(201).send({ status: true, data: savedData })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: "server issue" })
    }
}
//===========================================update reward in users wallet==================================================
//==============================weekley task================================================

const updateReward = async function (req, res) {
    let data = req.body
    if(!data){
        return res.status(400).send({status:false , message:"all fields are mandatory"})
    }
    let { duration, UserId, wallet } = data
    if (duration.played.end(0) - duration.played.start(0) === duration.duration) {
        let updated = planeManagementModel.findByIdAndUpdate({ _id: UserId }, { wallet: "₹150 to ₹250" })
    } else {
        console.log("Some parts were skipped");
    }
}

//=========================================monthly task==============================================
const weeklyTask = async function (req, res) {
    let data = req.body
    if(!data){
        return res.status(400).send({status:false , message:"all fields are mandatory"})
    }
    let { duration, UserId, wallet } = data
    if (duration.played.end(0) - duration.played.start(0) === duration.duration) {
        let updated = planeManagementModel.findByIdAndUpdate({ _id: UserId }, { wallet: "₹150 to ₹250" })
    } else {
        console.log("Some parts were skipped");
    }
}
//===================================================================================







module.exports = {uploadVideos,updateReward}