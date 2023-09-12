const express = require('express')
const router = express.Router()

const { sendEmail, sendEmailWithImages } = require('../utils/nodemailer')

router.get('/mail', sendEmail)
router.get('/mailWithImages', sendEmailWithImages)



module.exports = router