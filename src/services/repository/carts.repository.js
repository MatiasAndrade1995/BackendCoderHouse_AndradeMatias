class CartsRepository {
    constructor(dao) {
        this.dao = dao;
    }

    createCart = async (cartdto) => {
        return this.dao.createCart(cartdto);
    }
    
    getCart = async () => {
        return this.dao.getCart()
    }

    getProductInCart = async (cid) => {
        return this.dao.getProductInCart(cid);
    }

    getCartId = async (cid) => {
        return this.dao.getCartId(cid)
    }

    getProductsInCartId = async (cid) => {
        return this.dao.getProductsInCartId(cid)
    }

    addProductsInCart = async (email, cid, pid, quantity) => {
        return this.dao.addProductsInCart(email, cid, pid, quantity);
    }

    deleteProductsCart = async (cid) => {
        return this.dao.deleteProductsCart(cid);
    }

    deleteProductSelectedCart = async (cid, pid) => {
        return this.dao.deleteProductSelectedCart(cid, pid);
    }

    purchaseCart = async (cid) => {
        return this.dao.purchaseCart(cid);
    }
}

module.exports = CartsRepository;