const Carts = require("../dao/mongodb/carts.mongo");

const cartService = new Carts()

const creatCartController = async (req, res) => {
    const body = req.body
    try {
        const newCart = await cartService.createCart(body)
        req.logger.info(newCart)
        res.status(200).send(newCart)
    } catch (error) {
        res.status(404).send({ error: 'Error trying create Cart' })
    }
}

const getCartsController = async (req, res) => {
    try {
        const carts = await cartService.getCart()
        res.status(200).send(carts)
    } catch (error) {
        res.status(404).send(error)
    }
}

const getProductsInCartController = async (req, res) => {
    const { cid } = req.params
    try {
        const cartSelectedPopulated = await cartService.getProductInCart(cid)
        res.status(200).send(cartSelectedPopulated)
    } catch (error) {
        res.status(404).send({ error: 'Error trying create User' })
    }
}

const getCartId = async (req, res) => {
    const cid = req.user.cartID
    try {
        const cart = await cartService.getCartId(cid)
        res.status(200).send(cart)
    } catch(error) {
        req.logger.error(error)
    }
}


const getProductsInCartIdController = async (req, res) => {
    const { cid } = req.params
    try {
        const dataCartId = await cartService.getProductsInCartId(cid);
        res.status(200).render('cartid', {
            productsCart: dataCartId,
            email: req.user.email,
            firstname: req.user.first_name,
            lastname: req.user.last_name,
            rol: req.user.rol,
            cartID: req.user.cartID
        });
    } catch (error) {
        res.status(404).send({ error: 'Error try found Users cart' })
    }
}


const productsInCartController = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const email = req.user.email;
    try {
        const answer = await cartService.productsInCart(email, cid, pid, quantity)
        res.status(answer.status).send({ ok: answer.ok, msg: answer.msg })
    } catch (error) {
        res.status(500).send({ok: false, msg: 'Error in server' });
    }
};

const deleteProductsCartController = async (req, res) => {
    const {cid} = req.params;
    try {
        const cartEmpty = await cartService.deleteProductsCart(cid)
        res.status(cartEmpty.status).send(cartService.answer)
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
};

const deleteProductSelectedCartController = async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const productInCartDeleted = await cartService.deleteProductSelectedCart(cid, pid);
        res.status(productInCartDeleted.status).send(productInCartDeleted.answer)
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
};

const purchaseCart = async (req, res) => {
    const { cid } = req.params;
    try {
        const result = await cartService.purchaseCart(cid);
        res.status(201).send(result)
    } catch (error) {
        res.status(500).send({error: error})
    }
}

module.exports = { creatCartController, getCartsController, getProductsInCartController, productsInCartController, deleteProductsCartController, deleteProductSelectedCartController, getProductsInCartIdController, getCartId, purchaseCart };