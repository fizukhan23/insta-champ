const mongoose = require("mongoose");

const franchiseeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: false
    },
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: false
    },
   vaildtill: {
        type: Date,
        required: false
    },
})

franchiseeSchema.set('timestamps', true);
module.exports = mongoose.model("franchisee", franchiseeSchema);