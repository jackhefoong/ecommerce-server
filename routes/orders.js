const express = require('express');
const router = express.Router()
const Product = require('../models/Product');
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const auth = require('../middleware/auth')

router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user.id
        // const {itemId, quantity} = req.body 
        // const product = await Product.findById(itemId)
        const cart = await Cart.findOne({userId})
        
        // if(quantity > product.quantity) {
        //     return res.json({msg : "Don't buy so much la punde"})
        // }

        if(cart) {
            await Order.create({
                userId,
                items: cart.items,
                total: cart.total
            })

            cart.items.forEach(async item => {
                const product2 = await Product.findOne({"_id" : item.itemId})
                let updateQuantity = product2.quantity - item.quantity
                const update = await Product.findOneAndUpdate({"_id" : item.itemId}, {"quantity" : updateQuantity})
            })

            await Cart.findByIdAndDelete({_id : cart.id})
            return res.json({msg : "Checked out successfully"})
        }

    } catch(e) {
        return res.status(400).json(e)
    }
})

//Get all orders for that user who is logged in
//GET ALL ORDERS IF THE ADMIN IS LOGGED IN
router.get("/", auth, async(req, res) => {
    try {
        const userId = req.user.id
        if(req.user.isAdmin) {
            let allOrders = await Order.find({})
            return res.json(allOrders)
        } else {
            let orders = await Order.find({userId})
            if(orders.length >= 1) {
                console.log(orders)
                return res.json(orders)
            } else {
                return res.json({msg: "You have no orders"})
            }
        }
    } catch(e) {

    }
})

module.exports = router