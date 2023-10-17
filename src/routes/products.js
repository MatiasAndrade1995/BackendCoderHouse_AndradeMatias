const express = require('express')
const router = express.Router()
const uploadMulter = require('../utils/multer')

const { getProductsControllerWithoutPaginate, getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime, getProductsControllerView, getMockingProducts, validateFieldsProduct, getProductsController } = require ('../controllers/products')
const { authloginsession, isAdminMiddleware, isUserMiddleware } = require('../controllers/sessions')


router.get("/products", getProductsControllerView)
router.get('/realtimeproducts', getProductsControllerRealTime)
router.get("/allProducts", getProductsControllerWithoutPaginate)
router.get("/mockingproducts", getMockingProducts)
router.post("/products",  createProductController)
router.get("/products/:pid", getProductController)
router.put("/products/:pid",  updateProductController)
router.delete("/products/:pid",deleteProductController)
router.get('/productsDetail', getProductsController)


module.exports = router;