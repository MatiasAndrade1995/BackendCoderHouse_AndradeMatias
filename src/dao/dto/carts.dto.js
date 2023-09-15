class CartDTO {
    constructor(cart) {
        if (cart) {
            this.name = cart.name;
            this.products = Array.isArray(cart.products) ? cart.products.map(product => ({
                description: product.product.description,
                code: product.product.code,
                price: product.product.price,
                status: product.product.status,
                stock: product.product.stock,
                category: product.product.category,
                thumbnail: product.product.thumbnail,
                quantity: product.quantity
            })) : [];
        } else {
            logger.error('Invalid cart data');
        }
    }
}

module.exports = CartDTO;