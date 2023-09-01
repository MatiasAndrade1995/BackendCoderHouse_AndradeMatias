const express = require('express')
const router = express.Router()

const { productsInCartController, creatCartController, getCartsController, deleteProductsCartController, deleteProductSelectedCartController, getProductsInCartIdController, getCartId, purchaseCart } = require('../controllers/carts')
const { authloginsession, isUserMiddleware } = require('../controllers/sessions')

router.get("/carts", getCartsController)
router.get("/carts/:cid", getProductsInCartIdController)
router.get("/cartid", getCartId)
router.post("/carts", authloginsession, creatCartController)
router.put("/carts/:cid/products/:pid", authloginsession, isUserMiddleware, productsInCartController)
router.delete("/carts/:cid", authloginsession, isUserMiddleware, deleteProductsCartController)
router.delete("/carts/:cid/products/:pid", authloginsession, isUserMiddleware, deleteProductSelectedCartController)
router.post("/carts/:cid/purchase", purchaseCart)

module.exports = router