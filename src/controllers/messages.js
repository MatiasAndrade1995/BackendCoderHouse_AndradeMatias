const Message = require('../dao/models/messages');
const { transformDataChat } = require('../utils/transformdata');

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find()
        console.log(messages)
        res.render('chat', {
            messages: messages
        })
    } catch (error) {
        res.render('chat', {
            error: 'Error read chat...'
        })
    }
}

const createMessage = async (req, res) => {
    const body = req.body;
    try {
        const messages = await Message.create(body)
        res.status(201).send(messages)
    } catch (err) {
        if (err.error) {
            res.status(404).send(err)
        } else {
            if (err.errors) {
                res.status(404).send({ error: err.message })
            } else {
                res.status(404).send({ error: 'user already be declared in databases' })
            }
        }
    }
}

const getMessagesRealtimeController = async (req, res) => {
    try {
        const messages = await Message.find()
        let dataMessages = transformDataChat(messages)
        console.log(dataMessages)
        res.render('chat', {
            messages: dataMessages
        })
    } catch (error) {
        res.render('chat', {
            error: 'Error'
        })
    }
}

module.exports = {getMessages, createMessage, getMessagesRealtimeController}