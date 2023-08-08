const express = require('express')
const router = express.Router()

const { getMessagesRealtimeController, createMessage } = require('../controllers/messages')
router.get('/chat', getMessagesRealtimeController)
router.post('/chat', createMessage)

module.exports = router;