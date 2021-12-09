const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new Schema({
    name : { type: String},
    quantity : { type: Number},
    price : { type: Number},
    image : { type: String},
    description : { type: String},
    category : { type: String}
})

module.exports = mongoose.model('Product', ProductSchema)