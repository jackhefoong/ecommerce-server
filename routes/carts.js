const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

//VIEW CART localhost:4000/cart/
router.get("/", auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({userId: req.user.id})
        if(cart && cart.items.length > 0) {
            return res.json(cart)
        } else {
            return res.json({msg: "Your cart is empty"})
        }
    }catch(e) {
        return res.status(400).json(e)
    }
})

router.post("/", auth, async (req, res) => {
    try {
        const userId = req.user.id
        const { quantity, itemId } = req.body
        const product = await Product.findById(itemId)
        const cart = await Cart.findOne({userId})

        if(quantity > product.quantity) return res.json({msg: "Quantity"})

        //IF CART IS EMPTY
        if(cart === null) {
            const newCart = await Cart.create({
                userId,
                items: [{itemId, name: product.name, quantity, price: product.price, subtotal: product.price * quantity}],
                total: product.price * quantity
            })
            return res.json({msg: "Item added to cart successfully", newCart})
        }

        if(cart) {
            const foundProduct = cart.items.find(item => item.itemId === itemId)
            //if youre adding an item already existing in your cart
            if(foundProduct) {
                foundProduct.quantity += quantity
                foundProduct.subtotal += (quantity * foundProduct.price)
                cart.total = foundProduct.quantity * foundProduct.price
            } else {
                cart.items.push({
                    itemId,
                    name: product.name,
                    quantity,
                    price: product.price,
                    subtotal: product.price * quantity
                })
                cart.total += (product.price * quantity)
            }
            await cart.save()
            return res.json({msg: "Added to cart succesfully", cart: cart.items, total: cart.total})
        }
    }catch(e) {
        return res.status(400).json({msg:e})
    } 

}) //closing of the router

//DELETE A SINGLE ITEM ON THE CART
router.delete("/:id", auth, async (req, res)=> {
    try {
        let itemId = req.params.id;
        let userId = req.user.id;
        await Cart.findOneAndUpdate(
            {userId},
            {$pull: { items: {itemId} }},
            {new: true}
        )
        return res.json({msg: "Item successfully deleted"})
    } catch(e) {
        return res.json({msg: "Can't delete the item"})
    }
})

//UPDATE ITEM QUANTITY
router.put("/", auth, async (req, res) => {
    try {
        const userId = req.user.id
        const { quantity, itemId } = req.body
        const product = await Product.findById(itemId)
        const cart = await Cart.findOne({userId})

        
        if(cart) {
            const foundProduct = cart.items.find(item => item.itemId === itemId)
            //if youre adding an item already existing in your cart
            if(foundProduct) {
                foundProduct.quantity = parseInt(quantity)
                foundProduct.subtotal = parseInt((quantity * foundProduct.price))
                cart.total = parseInt(foundProduct.quantity * foundProduct.price)
            }
            await cart.save()
            return res.json({msg: "Item quantity successfully updated", cart: cart.items, total: cart.total})
        }
    } catch(e) {
        return res.json({msg: "KENOTSS :(("})
    }
})

//DELETE ALL THE ITEMS IN THE CART (EMPTY THE CART)
router.delete("/", auth, async(req, res) => {
    try {
        let userId = req.user.id
        await Cart.findOneAndDelete({userId})
        return res.json({msg: "Cart emptied"})
    } catch (e) {
        return res.json({msg: "You no heb cart >:("})
    }
})


module.exports = router