const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        unique: false,
        required: true 
    },
    last_name: {
        type: String,
        unique: false,
        required: true 
    },
    email: {
        type: String,
        unique: true,
        required: true 
    },
    age: {
        type: Number,
        unique: false,
        required: true 
    },
    password: {
        type: String,
        unique: false,
        required: true 
    },
    cartID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        strict: true
    },
    rol: {
        type: ['user', 'admin', 'premium'],
        unique: false,
        default: 'user'
    },   
});

const User = mongoose.model('user', userSchema)
module.exports = User;
