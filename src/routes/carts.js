const express = require('express')
const router = express.Router()

const { productsInCartController, creatCartController, getCartsController, deleteProductsCartController, deleteProductSelectedCartController, getProductsInCartIdController, getCartId, purchaseCart } = require('../controllers/carts')
const { authloginsession, isUserMiddleware } = require('../controllers/sessions')

router.get("/carts", getCartsController)
router.post("/carts", creatCartController)
router.get("/cartid", getCartId)
router.get("/carts/:cid", getProductsInCartIdController)
router.delete("/carts/:cid", deleteProductsCartController)
router.put("/carts/:cid/products/:pid", productsInCartController)
router.delete("/carts/:cid/products/:pid",deleteProductSelectedCartController)
router.post("/carts/:cid/purchase", purchaseCart)

module.exports = router