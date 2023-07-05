const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength:[10,'Limit characteres superate. Max 10']
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
        required: true
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
    }
}, {
    timestamps: true,
    versionKey: false
})

productSchema.plugin(mongoosePaginate)
const Product = mongoose.model('Product', productSchema)
module.exports = Product;