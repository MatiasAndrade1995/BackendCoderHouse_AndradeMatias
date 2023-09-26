const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean, 
        required: true,
        default: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true,
    versionKey: false
})

productSchema.plugin(mongoosePaginate)
const Product = mongoose.model('Product', productSchema)
module.exports = Product;