const ProductsRepository = require('../repositories/products.repository'); 

const productsRepository = new ProductsRepository();

class Products {

    constructor() { }

    async paginateProducts(category, status, limit, sort, page, limitQueryParams, order) {
    const dataProducts = await productsRepository.paginateProducts(category, status, limit, sort, page, limitQueryParams, order);
        return dataProducts;
    }

    async getProducts() {
        const dataProducts = await productsRepository.getProducts();
        return dataProducts;
    }

    async getProductById(pid) {
        const product = await productsRepository.getProductById(pid);
        return product;
    }

    async createProduct(productdto, file) {
        const product = await productsRepository.createProduct(productdto, file);
        return product;
    }

    async updateProductById(pid, productdto, file) {
        const productReplaced = await productsRepository.updateProductById(pid, productdto, file);
        return productReplaced;
    }

    async deleteProductById(id) {
        const product = await productsRepository.deleteProductById(id);
        return product;
    }
}

module.exports = Products;