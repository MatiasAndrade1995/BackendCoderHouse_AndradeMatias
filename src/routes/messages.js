const express = require('express')
const router = express.Router()

const { getMessagesRealtimeController, createMessage } = require('../controllers/messages')
const { authloginsession, isUserMiddleware } = require('../controllers/sessions')

router.get('/chat', authloginsession, isUserMiddleware, getMessagesRealtimeController)
router.post('/chat', authloginsession, isUserMiddleware, createMessage)

module.exports = router;