const express = require('express')

const router = express.Router()

const { changeRol, documents } = require('../controllers/sessions');
const { uploadFiles } = require('../utils/multer')

router.get('/users/premium/:uid', changeRol);
router.post('/users/:uid/documents', uploadFiles, documents);

module.exports = router