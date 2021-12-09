const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const auth = require('../middleware/auth')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')


//ADD PRODUCT
router.post("/", auth, (req, res) => {
    if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized not an admin"})
    
    const form = new formidable.IncomingForm()
    form.parse(req, (e, fields, files) => {
        if(e) return res.json({e})
        let date = new Date().getTime()
        const product = new Product(fields)
        let oldPath = files.image.filepath
        let newPath = path.join(__dirname, "../public/")+date+"-"+files.image.originalFilename
        let rawData = fs.readFileSync(oldPath)
        fs.writeFileSync(newPath, rawData)
        product.image = "/public/"+date+"-"+files.image.originalFilename
        product.save()
        return res.json({msg: "Product added successfully", product})
    })
})

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        let products = await Product.find({})
        return res.json(products)
    } catch(e) {
        return res.json({e, msg:"No products found"})
    }
})

//GET A SINGLE PRODUCT BY ID
router.get("/:id", async (req, res) => {
   try {
    let product = await Product.findById(req.params.id)
    return res.json(product)
   } catch(e) {
       return res.json({e, msg: "Product doesn't exist"})
   }
})

//GET ALL PRODUCTS BY KEYWORD
router.get("/search/:key", async (req, res) => {
    try {
        let product = await Product.find(
            {name: {$regex: req.params.key, $options: "i"}}
            )

        if(product.length === 0) {
            return res.json({msg: "No heb"})
        }
        return res.json(product)
    } catch (e) {
        console.log(req.params.key)
        return res.json({e, msg:"No heb"})
    }
})

//UPDATE A PRODUCT
router.put("/:id", auth, (req, res) => {
    try {
        if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized"})
        
        const form = new formidable.IncomingForm()
        form.parse(req, async (e, fields, files) => {
            if(e) return res.json({e})
            let date = new Date().getTime()
            let updates = fields
            console.log(files)
            if(files.hasOwnProperty("nimage")){
                let oldPath = files.nimage.filepath
                let newPath = path.join(__dirname, "../public/")+date+"-"+files.nimage.originalFilename
                let rawData = fs.readFileSync(oldPath)
                let deleteImg = await Product.findById(req.params.id)
                fs.unlinkSync(path.join(__dirname, "../", deleteImg.image))
                fs.writeFileSync(newPath, rawData)
                updates.image = "/public/"+date+"-"+files.nimage.originalFilename
            }
            let product = await Product.findByIdAndUpdate(req.params.id, updates)
            return res.json({msg: "Product updated successfully", product})
        })
    } catch(err) {
        console.log(err)
        return res.json({msg:"Product does not exist"})
    }
})

//DELETE A PRODUCT
router.delete("/:id", auth, async (req,res) => {
    try {
        if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized"})
        let product = await Product.findByIdAndDelete(req.params.id)
        fs.unlinkSync(path.join(__dirname, "../", product.image)) //path/to/folder/public/image.jpg
        return res.json({msg: "Product successfully deleted"})
    } catch(e) {
        return res.json({e, msg: "Cannot delete product"})
    }
})

module.exports = router