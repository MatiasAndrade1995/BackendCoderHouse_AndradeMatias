const express = require('express')
const router = express.Router()
const uploadMulter = require('../utils/multer')

const { getProductsControllerWithoutPaginate, getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime, getProductsControllerView, getMockingProducts, validateFieldsProduct } = require ('../controllers/products')
const { authloginsession, isAdminMiddleware, isUserMiddleware } = require('../controllers/sessions')


router.get("/products", authloginsession, isUserMiddleware, getProductsControllerView)
router.get('/realtimeproducts', isAdminMiddleware, getProductsControllerRealTime)
router.get("/products/:pid", isUserMiddleware, getProductController)
router.get("/allProducts", getProductsControllerWithoutPaginate)
router.post("/products", isAdminMiddleware, uploadMulter.single('thumbnail'),validateFieldsProduct, createProductController)
router.put("/products/:pid", isAdminMiddleware, uploadMulter.single('thumbnail'), updateProductController)
router.delete("/products/:pid", isAdminMiddleware, deleteProductController)
router.get("/mockingproducts", getMockingProducts)


module.exports = router;