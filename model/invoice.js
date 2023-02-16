const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    sno:{type:Number,required:true},
    uid:{type:Number,required:true},
    invoicedata:{type:String},
    date:{type:Date},
    Re_number:{type:String},
    quantity:{type:Number},
    gst:{type: Number},
    amount:{type: Number},
    paid_on:{type:Date},
    buyer_name:{type:String},
    product:{type: Number},
    sub_total:{type:Number},
    total_price:{type:Number}
});
invoiceSchema.set('timestamps', true);
module.exports = mongoose.model("invoice", invoiceSchema);