const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    messageUser: {
        type: String,
        required: true
    }      
}, {
    timestamps: true,
    versionKey: false
})

const Message = mongoose.model('message', messageSchema)

module.exports = Message;