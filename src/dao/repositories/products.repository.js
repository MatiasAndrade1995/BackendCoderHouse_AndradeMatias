const productsModel = require('../models/products');
const ProductDTO = require('../dto/products.dto');
const fs = require('fs');
const { transformDataProducts } = require('../../utils/transformdata');

class ProductsRepository {
    constructor() { }

    async paginateProducts(category, status, limit, sort, page, limitQueryParams, order) {
        let query = {};
        if (category || status) {
            query = { $or: [{ category: category }, { status: status }] };
        }
        const products = await productsModel.paginate(query, {
            limit: limitQueryParams,
            sort: { price: order },
            page: page || 1
        });

        const dataProducts = transformDataProducts(products.docs);
        return dataProducts;
    }

    async getProducts() {
        const products = await productsModel.find();
        const dataProducts = transformDataProducts(products);
        return dataProducts;
    }

    async getProductById(pid) {
        const product = await productsModel.findById(pid);
        if (!product) {
            return { error: `The product with ID ${pid} doesn't exist` };
        }
        return product;
    }

    async createProduct(body, file) {
        if (file) {
            body.thumbnail = `http://localhost:8080/storage/products/${file.filename}`;
        }
        const productdto = new ProductDTO(body);
        const product = await productsModel.create(productdto);
        return product;
    }

    async updateProductById(pid, body, file) {
        const dataReplace = {
            ...body,
            thumbnail: file ? `http://localhost:8080/storage/products/${file.filename}` : body.thumbnail
        };

        if (file) {
            const product = await productsModel.findById(pid);
            if (product.thumbnail !== 'file') {
                const nameFile = product.thumbnail.split("/").pop();
                fs.unlinkSync(`${__dirname}/../../public/storage/products/${nameFile}`);
            }
        }

        const productdto = new ProductDTO(dataReplace);
        const productReplaced = await productsModel.findByIdAndUpdate(pid, productdto, { new: true });
        return productReplaced;
    }

    async deleteProductById(id) {
        const product = await productsModel.findByIdAndDelete(id);
        if (product.thumbnail !== 'file') {
            const file = product.thumbnail.split("/").pop();
            if (file) {
                fs.unlinkSync(`${__dirname}/../../public/storage/products/${file}`);
            }
        } else {
            console.log("Product has no thumbnail.");
        }
        if (!product) {
            throw { error: `The product with ID ${pid} doesn't exist` };
        }
        return product;
    }
}

module.exports = ProductsRepository;