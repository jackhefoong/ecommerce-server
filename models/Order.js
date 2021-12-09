const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OrderSchema = new Schema ({
    userId: {type: String},
    items: [{
        itemId: {type: String},
        name: {type: String},
        quantity: {type: Number, default: 1},
        price: {type: Number},
        subtotal: {type: Number}
    }],
    total: {type: Number},
    purchased_date: {type: Date, default: Date.now()}
})

module.exports = mongoose.model("Order", OrderSchema)