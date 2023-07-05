const ProductManagerInCart = require("../dao/fs/ProductManagerCart")
const productManagerInCart = new ProductManagerInCart();
const getProductsControllerCart = async (req, res) => {
    try {
        const { cid } = req.params
        const ressGetProductsUser = await productManagerInCart.getProductsUser(cid)
        if (ressGetProductsUser.error) throw ressGetProductsUser
        res.send(ressGetProductsUser)
    } catch (error) {
        res.status(404).send(error)
    }
}
const addProductUserControllerCart = async (req, res) => {
    try {
        const { cid, pid } = req.params
        const productBuyUser = await productManagerInCart.addProductUserCart(cid, pid)
        if (productBuyUser.error) throw productBuyUser
        res.send(productBuyUser)
    }
    catch (error) {
        res.status(404).send(error)
    }
}

const createUserControllerCart = async (req, res) => {
    try {
        const body = req.body;
        const ressaddProductInCart = await productManagerInCart.addUserCart(body.id, body.productsCartId)
        if (ressaddProductInCart.error) throw ressaddProductInCart
        res.send(ressaddProductInCart)
    } catch(error) {
        res.status(404).send(error)
    }
}

const deleteProductCart = async(req,res) => {
    try {
        const { cid, pid } = req.params
        const ressDeleteProductCart = await productManagerInCart.deleteProductUserCart(cid, pid)
        if (ressDeleteProductCart.error) throw ressDeleteProductCart
        res.send(ressDeleteProductCart)
    } catch (error) {
        res.status(404).send(error)
    }
}

module.exports = { getProductsControllerCart, createUserControllerCart, addProductUserControllerCart, deleteProductCart}