const cartsModel = require('../models/cart')
const ticketsModel = require('../models/tickets')
const CartDTO = require('../dto/carts.dto')
const productsModel = require('../models/products')
const usersModel = require('../models/users')
const { transformDataCart } = require('../../utils/transformdata');
const uuid = require('uuid');
const User = require('../models/users')

class CartsRepository {
    constructor() { }

    async createCart(body) {
        const cartdto = new CartDTO(body);
        const newCart = await cartsModel.create(cartdto)
        if (!newCart) return { status: 404, answer: 'Error trying to create cart' }
        return newCart;
    }

    async getCart() {
        const carts = await cartsModel.find()
        if (!carts) return { status: 404, answer: 'Error trying to find carts' };
        return  { status: 200, answer: carts };
    }

    async getProductInCart(cid) {
        const cartSelectedPopulated = await cartsModel.findById(cid).populate('products.product')
        if (!cartSelectedPopulated) return { status: 404, answer: 'Error trying to find cart' };
        return JSON.stringify(cartSelectedPopulated, null, '\t');
    }
    async getCartId(cid) {
        const cart = await cartsModel.findById(cid)
        if (!cart) return { status: 404, answer: 'Error trying to find cart' };
        return cart;
    }

    async getProductsInCartId(cid) {
        const productsInCart = await cartsModel.findById(cid).populate('products.product');
        if (!productsInCart) return { status: 404, answer: 'Error trying to find cart' };
        const { products } = productsInCart
        const dataCartId = transformDataCart(products)
        return dataCartId;
    }

    async productsInCart(email, cid, pid, quantity) {
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
                    return { ok: true, status: 201, msg: `Product ${product.title} has been add in your cart`};
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


    async deleteProductsCart(cid) {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return { status: 404, answer: 'Error trying to find cart' };
        }
        if (cart.products.length > 0) {
            if (cart) {
                cart.products.splice(0, cart.products.length);
                await cart.save();
                const cartUpdated = await cartsModel.findById(cid).populate('products.product')
                if (!cartUpdated) {
                    return { status: 404, answer: 'Error trying to find cart' };
                }
                return { status: 201, answer: cartUpdated };
            } else {
                return { status: 404, answer: 'Error try find cart' };
            }
        } else {
            const cartUpdated = await cartsModel.findById(cid).populate('products.product')
            if (!cartUpdated) {
                return { status: 404, answer: 'Error try find cart' };
            }
            return { status: 404, error: 'Cart empty', answer: cartUpdated };
        }
    }

    async deleteProductSelectedCart(cid, pid) {

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




    async purchaseCart(cid) {
        const user = await usersModel.findOne({ cartID: cid }).populate('cartID');

        if (!user) {
            throw new Error('User not found');
        }

        const cart = await cartsModel.findById(cid).populate('products.product');

        if (!cart) {
            throw new Error('Cart not found');
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
            throw new Error('Error trying create ticket');
        }

        return [
            ticket,
            cart
        ];
    }


}


module.exports = CartsRepository;