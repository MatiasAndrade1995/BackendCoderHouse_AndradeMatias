const express = require('express')
const router = express.Router()
const {uploadFiles } = require('../utils/multer')

const { getProductsControllerWithoutPaginate, getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime, getProductsControllerView, getMockingProducts, validateFieldsProduct, categories, getProductsController } = require('../controllers/products')
const { authloginsession, isAdminMiddleware, isUserMiddleware,  } = require('../controllers/sessions')

router.get("/products", authloginsession, isUserMiddleware, getProductsControllerView)
router.get('/realtimeproducts', isAdminMiddleware, getProductsControllerRealTime)
router.get("/allProducts", getProductsControllerWithoutPaginate)
router.get("/productsDetail", getProductsController)
router.get("/mockingproducts", getMockingProducts)
router.post("/products", isAdminMiddleware, uploadFiles, validateFieldsProduct, createProductController) 
router.get("/products/:pid", isUserMiddleware, getProductController)
router.put("/products/:pid", uploadFiles, updateProductController)
router.delete("/products/:pid",  deleteProductController) 
router.get("/categories", categories)
router.get("/productsTest/:pid", getProductController)

module.exports = router;