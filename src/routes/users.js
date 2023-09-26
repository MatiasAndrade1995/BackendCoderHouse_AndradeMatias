const express = require('express')
const router = express.Router()

const { changeRol } = require('../controllers/sessions');
router.get('/users/premium/:uid', changeRol);

module.exports = router