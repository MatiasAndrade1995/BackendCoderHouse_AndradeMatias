const Product = require('../dao/models/products');
const Cart = require("../dao/models/cart");
const { transformDataCart } = require("../utils/transformdata");


const creatCartController = async (req, res) => {
    const body = req.body
    try {
        const newCart = await Cart.create(body)
        res.status(200).send(newCart)
    } catch (error) {
        res.status(404).send({ error: 'Error al crear Cart' })
    }
}

const getCartsController = async (req, res) => {
    try {
        const carts = await Cart.find()
        res.status(200).send(carts)
    } catch (error) {
        res.status(404).send(error)
    }
}

const getProductsInCartController = async (req, res) => {
    const { cid } = req.params
    try {
        const cartSelectedPopulated = await Cart.findById(cid).populate('products.product')
        res.status(200).send(JSON.stringify(cartSelectedPopulated, null, '\t'))
    } catch (error) {
        res.status(404).send({ error: 'Error al intentar encontrar carrito del usuario' })
    }
}

const getProductsInCartIdController = async (req, res) => {
    const { cid } = req.params
    try {
        const productsInCart = await Cart.findById(cid).populate('products.product');
        const { products } = productsInCart
        const dataCartId = transformDataCart(products)
        console.log(dataCartId)
        res.status(200).render('cartid', {
            productsCart: dataCartId
        });
    } catch (error) {
        res.status(404).send({ error: 'Error try found Users cart' })
    }
}


const productsInCartController = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    console.log(req.body)
    try {
        const product = await Product.findById(pid);
        const cart = await Cart.findById(cid);
        const stock = product.stock;
        const productInCartIndex = cart.products.findIndex(entry => entry.product.toString() === pid);
        if (productInCartIndex != -1) {
            if (product) {
                const existingQuantity = cart.products.find(entry => entry.product.toString() === pid)?.quantity || 0;
                const totalQuantity = existingQuantity + quantity;
                if (totalQuantity < stock) {
                    cart.products[productInCartIndex].quantity = totalQuantity;
                    product.stock -= quantity;
                    await product.save();
                    await cart.save();
                    const cartUpdated = await Cart.findById(cid).populate('products.product');
                    res.status(201).send(JSON.stringify(cartUpdated, null, '\t'));
                } else {
                    res.status(400).send({ error: 'Quantity exceeds available' });
                }
            } else {
                res.status(404).send({ error: 'Error try found cart or product' });
            }
        } else {
            if (product) {
                if (quantity <= stock) {
                    cart.products.push({ product: product._id, quantity: 1 });
                    product.stock -= quantity;
                    await product.save();
                    await cart.save();
                    const cartUpdated = await Cart.findById(cid).populate('products.product');
                    res.status(201).send(JSON.stringify(cartUpdated, null, '\t'));
                } else {
                    res.status(400).send({ error: 'Quantity exceeds available' })
                }
            } else {
                res.status(404).send({ error: 'Error try found cart or product' });
            }
        }    
    } catch (error) {
        res.status(500).send({ error: 'Error in server' });
    }
};

const deleteProductsCartController = async (req, res) => {
    const {cid} = req.params;
    const cart = await Cart.findById(cid);
    try {
        if (cart.products.length > 0) {
            if (cart) {
                cart.products.splice(0, cart.products.length);
                await cart.save();
                const cartUpdated = await Cart.findById(cid).populate('products.product')
                res.status(201).send({ message: 'Products removed from cart', res: cartUpdated });
            } else {
                res.status(404).send({ error: 'Error trying to find cart or product' });
            }
        } else {
            const cartUpdated = await Cart.findById(cid).populate('products.product')
            res.status(404).send({ error: 'Cart empty', res: cartUpdated });
        }
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
};

const deleteProductSelectedCartController = async (req, res) => {
    const { cid, pid } = req.params;
    const product = await Product.findById(pid);
    const cart = await Cart.findById(cid);
    try {
        if (cart.products.length > 0) {
            if (product && cart) {
                const productInCartIndex = cart.products.findIndex(entry => entry.product.toString() === pid);
                cart.products[productInCartIndex]._id
                cart.products.splice(productInCartIndex, 1);
                await cart.save();
                const cartUpdated = await Cart.findById(cid).populate('products.product')
                res.status(201).send({ message: 'Product selected removed from cart', res: cartUpdated });
            } else {
                res.status(404).send({ error: 'Error trying to find cart or product' });
            }
        } else {
            const cartUpdated = await Cart.findById(cid).populate('products.product')
            res.status(404).send({ error: 'Not found', res: cartUpdated });
        }
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
};


module.exports = { creatCartController, getCartsController, getProductsInCartController, productsInCartController, deleteProductsCartController, deleteProductSelectedCartController, getProductsInCartIdController };