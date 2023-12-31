const express = require('express')
const router = express.Router()

const { addProductsInCartController, creatCartController, getCartsController, deleteProductsCartController, deleteProductSelectedCartController, getProductsInCartIdController, getCartId, purchaseCart } = require('../controllers/carts')
const { authloginsession, isUserMiddleware } = require('../controllers/sessions')

router.get("/carts", getCartsController)
router.post("/carts", authloginsession, creatCartController)
router.post("/cartsTest", creatCartController)
router.get("/cartid", getCartId)
router.get("/carts/:cid", getProductsInCartIdController)
router.delete("/carts/:cid", authloginsession, isUserMiddleware, deleteProductsCartController)
router.put("/carts/:cid/products/:pid", authloginsession, isUserMiddleware, addProductsInCartController)
router.delete("/carts/:cid/products/:pid", authloginsession, isUserMiddleware, deleteProductSelectedCartController)
router.delete("/cartsTest/:cid/products/:pid", deleteProductSelectedCartController)
router.post("/carts/:cid/purchase", purchaseCart)

module.exports = router