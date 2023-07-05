const express = require('express')
const router = express.Router()
const decodForm = express.urlencoded({ extended: true })
const { login, loginUser, sessionMiddleware, authloginsession, formNewUser, dataProfile, registerNewUser, logout, authlogin} = require('../controllers/sessions')

router.get('/',login)
router.post('/login', decodForm, sessionMiddleware, authlogin, loginUser)
router.get('/profile', sessionMiddleware, authloginsession,dataProfile)
router.get('/register',formNewUser)
router.post('/register', decodForm, registerNewUser)
router.post('/logout', sessionMiddleware, logout)

module.exports = router;