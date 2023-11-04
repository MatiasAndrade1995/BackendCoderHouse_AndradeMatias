
const ProductsMongo = require('../dao/mongodb/products.mongo.js')
const CartsMongo = require('../dao/mongodb/carts.mongo.js')

const ProductsRepository = require ('../repository/products.repository.js')
const CartsRepository = require('../repository/carts.repository.js')

const productMongo = new ProductsMongo()
const cartMongo = new CartsMongo();

const productService = new ProductsRepository(productMongo);
const cartService = new CartsRepository(cartMongo);

module.exports = {
    productService,
    cartService
}