//Models 
const cartsModel = require('../models/cart')
const productsModel = require('../models/products')
const usersModel = require('../models/users')
const ticketsModel = require('../models/tickets')
//Transformdata Cart
const { transformDataCart } = require('../../../utils/transformdata');
//UUID
const uuid = require('uuid');
//LoggerCustom
const { logger } = require('../../../config/loggerCustom');

class CartsMongo {
    constructor() { 
        logger.info("Working carts with Database persistence in mongodb");
    }
    createCart = async (cartdto) => {
        const result = await cartsModel.create(cartdto)
        if (!result) return { ok: false, status: 404, error: 'Error trying to create cart' }
        return result;
    }

    getCart = async () => {
        const result = await cartsModel.find()
        if (!result) return {ok: false, status: 404, error: 'Error trying to find carts' };
        return result;
    }

    getProductInCart = async (cid) => {
        const result = await cartsModel.findById(cid).populate('products.product')
        if (!result) return {ok: false, error: 'Error trying to find cart' };
        return JSON.stringify(result, null, '\t');
    }

    getCartId = async (cid) => {
        const cart = await cartsModel.findById(cid)
        if (!cart) return { ok: false, error: 'Error trying to find cart' };
        return { ok: true, cart: cart };
    }

    getProductsInCartId = async (cid) => {
        const productsInCart = await cartsModel.findById(cid).populate('products.product');
        if (!productsInCart) return { ok: false, error: 'Error trying to find cart' };
        const { products } = productsInCart
        const result = transformDataCart(products)
        return result;
    }

    addProductsInCart = async (email, cid, pid, quantity) => {
        const product = await productsModel.findById(pid);
        const productOwner = product.owner;
        if (email !== productOwner) {
            if (!product) {
                return { ok: false, status: 404, msg: 'Error trying to find product' };
            }
            const cart = await cartsModel.findById(cid);
            if (!cart) {
                return { ok: false, status: 404, msg: 'Error trying to find cart' };
            }

            const productInCartIndex = cart.products.findIndex(entry => entry.product.toString() === pid);

            if (product) {
                if (productInCartIndex !== -1) {
                    const existingQuantity = cart.products.find(entry => entry.product.toString() === pid)?.quantity || 0;
                    const totalQuantity = existingQuantity + quantity;
                    cart.products[productInCartIndex].quantity = totalQuantity;
                    await cart.save();
                    const cartUpdated = await cartsModel.findById(cid).populate('products.product');
                    if (!cartUpdated) {
                        return { ok: false, status: 404, msg: 'Error trying to find cart' };
                    }
                    return { ok: true, status: 201, msg: `Product ${product.title} has been add in your cart` };
                } else {
                    cart.products.push({ product: product._id, quantity: quantity });
                    await cart.save();
                    const cartUpdated = await cartsModel.findById(cid).populate('products.product');
                    if (!cartUpdated) {
                        return { ok: false, status: 404, msg: 'Error trying to find cart' };
                    }
                    return { ok: true, status: 201, msg: JSON.stringify(cartUpdated, null, '\t') };
                }
            } else {
                return { ok: false, status: 404, msg: 'Error trying to find product' };
            }
        } else {
            return { ok: false, status: 404, msg: `Error, owner can not add product in his cart...` };
        }

    }

    deleteProductsCart = async (cid) => {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return { ok: false, error: 'Error trying to find cart' };
        }
        if (cart.products.length > 0) {
            if (cart) {
                cart.products.splice(0, cart.products.length);
                await cart.save();
                const cartUpdated = await cartsModel.findById(cid).populate('products.product')
                if (!cartUpdated) {
                    return { ok: false, error: 'Error trying to update' };
                }
                return { ok: true, answer: cartUpdated };
            } else {
                return { ok: false, error: 'Error try find cart' };
            }
        } else {
            const cartUpdated = await cartsModel.findById(cid).populate('products.product')
            if (!cartUpdated) {
                return { ok: false, error: 'Error try update cart' };
            }
            return { ok: false, error: 'This cart is empty', answer: cartUpdated };
        }
    }

    deleteProductSelectedCart = async (cid, pid) => {
        const product = await productsModel.findById(pid);
        const cart = await cartsModel.findById(cid);

        if (cart.products.length > 0) {
            if (product && cart) {
                const productInCartIndex = cart.products.findIndex(entry => entry.product.toString() === pid);
                cart.products[productInCartIndex]._id
                cart.products.splice(productInCartIndex, 1);
                await cart.save();
                const cartUpdated = await cartsModel.findById(cid).populate('products.product')
                return { status: 201, answer: cartUpdated };

            } else {

                return { status: 404, answer: 'Error trying to find cart or product' };
            }
        } else {
            const cartUpdated = await cartsModel.findById(cid).populate('products.product')
            return { status: 404, error: 'Not found', answer: cartUpdated };
        }
    }

    purchaseCart = async (cid) => {
            const user = await usersModel.findOne({ cartID: cid }).populate('cartID');

            if (!user) {
                return { ok: false, error: 'User not found' };
            }

            const cart = await cartsModel.findById(cid).populate('products.product');

            if (!cart) {
                return { ok: false, error: 'Cart not found' };
            }

            let totalAmount = 0;

            const productsToProcess = [];
            const productsNotProcessed = [];

            cart.products.forEach(cartProduct => {
                const product = cartProduct.product;
                const requestedQuantity = cartProduct.quantity;

                if (product.stock >= requestedQuantity) {
                    productsToProcess.push({
                        product: product,
                        quantity: requestedQuantity
                    });
                    totalAmount += product.price * requestedQuantity;
                } else {
                    productsNotProcessed.push({
                        product: product,
                        requestedQuantity: requestedQuantity,
                        availableStock: product.stock
                    });
                }
            });

            cart.products = productsNotProcessed.map(item => ({
                product: item.product,
                quantity: item.requestedQuantity
            }));

            if (productsToProcess.length <= 0) {
                return { ok: false , error: 'Cart is empty'};
            }
            await cart.save();

            const code = uuid.v4();
            const purchaser_datetime = new Date();
           
            const ticket = await ticketsModel.create({
                code: code,
                purchaser_datetime: purchaser_datetime,
                amount: totalAmount,
                purchaser: user.email
            });

            if (!ticket) {
                return { ok: false, error: 'Error trying create ticket' };
            }

            return [
                ticket,
                cart
            ];
    }

}

module.exports = CartsMongo;