const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CartSchema = new Schema ({
    userId: {type: String},
    items: [{
        itemId: {type: String},
        name: {type: String},
        quantity: {type: Number, default: 1},
        price: {type: Number},
        subtotal: {type: Number}
    }],
    total: {type: Number}
})

module.exports = mongoose.model("Cart", CartSchema, "cartitems")