const CartsRepository = require('../repositories/carts.repository');
const cartsRepository = new CartsRepository();

class Carts {
    constructor() { }
    
    async createCart(body) {
        const cart = await cartsRepository.createCart(body);
        return cart;
    }

    async getCart() {
        const cart = await cartsRepository.getCart();
        return cart;
    }

    async getProductInCart(cid) {
        const cart = await cartsRepository.getProductInCart(cid);
        return cart;
    }

    async getCartId(cid) {
        const cart = await cartsRepository.getCartId(cid);
        return cart;
    }

    async getProductsInCartId(cid) {
        const cart = await cartsRepository.getProductsInCartId(cid);
        return cart;
    }

    async productsInCart(email, cid, pid, quantity) {
        const answer = await cartsRepository.productsInCart(email, cid, pid, quantity);
        return answer;
    }

    async deleteProductsCart(cid) {
        const cart = await cartsRepository.deleteProductsCart(cid);
        return cart;
    }

    async deleteProductSelectedCart(cid, pid) {
        const cart = await cartsRepository.deleteProductSelectedCart(cid, pid);
        return cart;
    }

    async purchaseCart(cid) {
        const result = await cartsRepository.purchaseCart(cid)
        return result;
    }
}

module.exports = Carts;
