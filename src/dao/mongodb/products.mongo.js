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

    async createProduct(email, productdto, file) {
        const product = await productsRepository.createProduct(email, productdto, file);
        return product;
    }

    async updateProductById(pid, productdto, file) {
        const productReplaced = await productsRepository.updateProductById(pid, productdto, file);
        return productReplaced;
    }

    async deleteProductById(id , email) {
        const answer = await productsRepository.deleteProductById(id, email);
        return answer;
    }

    async getMockingProducts() {
        const products = await productsRepository.getMockingProducts()
        return products;
    }

}

module.exports = Products;