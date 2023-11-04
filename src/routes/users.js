const express = require('express')
const router = express.Router()
const decodForm = express.urlencoded({ extended: true })


const { documents, getUsers, deleteUsers, adminChangeRoleController, adminChangeDeleteController, userChangeRoleController, usersHandlebars, isAdminMiddleware } = require('../controllers/sessions');
const { uploadFiles } = require('../utils/multer')

router.get('/users/admin',isAdminMiddleware, usersHandlebars)
router.get('/users', getUsers);
router.delete('/users', deleteUsers);
router.post('/users/:uid/documents', uploadFiles, documents);
router.get('/users/premium/:uid', userChangeRoleController);
router.post('/users/:uid', decodForm, adminChangeRoleController)
router.delete('/users/:uid', adminChangeDeleteController)

module.exports = router