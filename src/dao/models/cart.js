const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');

const cartSchema = new mongoose.Schema({
    name: {
        type: String
    },
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref:'Product',
                },
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    strict: false
                },
                quantity: {
                    type: Number,
                    strict: false
                }
            }
                
        ]
    }
})

cartSchema.plugin(mongoosePaginate)
const Cart = mongoose.model('Cart', cartSchema)
module.exports = Cart;

