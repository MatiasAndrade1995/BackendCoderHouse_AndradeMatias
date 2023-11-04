class ProductsRepository {
    constructor(dao) {
        this.dao = dao;
    }

    paginateProducts = async (category, status, limit, sort, page, limitQueryParams, order) => {
        return this.dao.paginateProducts(category, status, limit, sort, page, limitQueryParams, order)
    }

    getProducts = async () => {
        return this.dao.getProducts();
    }


    getProductById = async (pid) => {
        return this.dao.getProductById(pid)
    }


    createProduct = async (email, filename, baseUrl, productDto) => {
        return this.dao.createProduct(email, filename, baseUrl, productDto)
    }


    updateProductById = async (pid, productdto, filename) => {
        return this.dao.updateProductById(pid, productdto, filename)
    }

    deleteProductById = async (pid, email) => {
        return this.dao.deleteProductById(pid, email);
    }

    getMockingProducts = async () => {
        return this.dao.getMockingProducts()
    }
}

module.exports = ProductsRepository;