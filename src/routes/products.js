const express = require('express')
const router = express.Router()
const uploadMulter = require('../utils/multer')

const {getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime, getProductsControllerView, } = require ('../controllers/products')
const {authloginsession, sessionMiddleware } = require('../controllers/sessions')

router.get("/products", sessionMiddleware, authloginsession,getProductsControllerView)
router.get('/realtimeproducts', getProductsControllerRealTime)
router.get("/products/:pid", getProductController)
router.post("/products", uploadMulter.single('thumbnail'),createProductController)
router.put("/products/:pid", uploadMulter.single('thumbnail'), updateProductController)
router.delete("/products/:pid", deleteProductController )

module.exports = router;