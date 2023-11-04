//Cart DTO
const CartDTO = require('../services/dto/carts.dto')
//Cart Service
const { cartService } = require('../services/repository/services');
//LoggerCustom
const { logger } = require('../../src/config/loggerCustom');

//Create 
const creatCartController = async (req, res) => {
    const body = req.body
    try {
        const cartdto = new CartDTO(body);
        const result = await cartService.createCart(cartdto)
        if (result == ok) {
        logger.info(result)
        return res.status(201).send(result)    
        }
        return res.status(404).send(result.error)
    } catch (error) {
        res.status(404).send({ error: 'Error trying create Cart' })
    }
}

//Read carts
const getCartsController = async (req, res) => {
    try {
        const carts = await cartService.getCart()
        if(result.ok == false) return res.status(404).send(result.error)
        res.status(200).send(carts)
    } catch (error) {
        res.status(500).send(error)
    }
}

//Read products in cart
const getProductsInCartController = async (req, res) => {
    const { cid } = req.params
    try {
        const result = await cartService.getProductInCart(cid)
        if(result.ok == false) return res.status(404).send(result.error)
        res.status(200).send(result)
    } catch (error) {
        res.status(404).send({ error: 'Error trying create User' })
    }
}

//Read user´s cart
const getCartId = async (req, res) => {
    const cid = req.user.cartID
    try {
        const cart = await cartService.getCartId(cid)
        if (cart.ok == false) return res.status(404).send(cart.error)
        res.status(200).send(cart)
    } catch(error) {
        req.logger.error(error)
        res.status(500).send('Internal error')
    }
}


//Render products in cart
const getProductsInCartIdController = async (req, res) => {
    const { cid } = req.params
    try {
        const dataCartId = await cartService.getProductsInCartId(cid);
        if (dataCartId.ok == false) return res.status(404).send(dataCartId.error)
        res.status(200).render('cartid', {
            productsCart: dataCartId,
            email: req.user.email,
            firstname: req.user.first_name,
            lastname: req.user.last_name,
            rol: req.user.rol,
            cartID: req.user.cartID
        });
    } catch (error) {
        res.status(500).send('Internal error')
    }
}

//Add products in Cart
const addProductsInCartController = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const email = req.user.email;
    try {
        const answer = await cartService.addProductsInCart(email, cid, pid, quantity)
        res.status(answer.status).send({ ok: answer.ok, msg: answer.msg })
    } catch (error) {
        res.status(500).send({ ok: false, msg: 'Internal error' });
    }
};

//Delete products in Cart
const deleteProductsCartController = async (req, res) => {
    const {cid} = req.params;
    try {
        const cartEmpty = await cartService.deleteProductsCart(cid)
        if (cartEmpty.ok == false) return res.status(404).send(cartEmpty.error)
        res.status(201).send(cartEmpty.answer)
    } catch (error) {
        res.status(500).send('Internal error');
    }
};

//Delete product selected in Cart
const deleteProductSelectedCartController = async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const productInCartDeleted = await cartService.deleteProductSelectedCart(cid, pid);
        res.status(productInCartDeleted.status).send(productInCartDeleted.answer)
    } catch (error) {
        res.status(500).send({ error: 'Internal error' });
    }
};

const purchaseCart = async (req, res) => {
    const { cid } = req.params;
    try {
        const result = await cartService.purchaseCart(cid);
        if(result.ok == false) return res.status(404).json({error:result.error})
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send('Internal error');
    }
}

module.exports = { creatCartController, getCartsController, getProductsInCartController, addProductsInCartController, deleteProductsCartController, deleteProductSelectedCartController, getProductsInCartIdController, getCartId, purchaseCart };