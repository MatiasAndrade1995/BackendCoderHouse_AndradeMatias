const productsModel = require('../models/products');
const ProductDTO = require('../dto/products.dto');
const fs = require('fs');
const { transformDataProducts } = require('../../utils/transformdata');
const { faker } = require("@faker-js/faker");
const { logger } = require('../../config/loggerCustom');

class ProductsRepository {
    constructor() { }

    async getMockingProducts() {
        try {
            const mockingProducts = [];
            for (let i = 0; i < 100; i++) {
                const product = await productsModel.create({
                    title: faker.commerce.productName(),
                    description: faker.commerce.productDescription(),
                    code: faker.string.numeric(5),
                    price: faker.commerce.price(),
                    stock: faker.string.numeric(),
                    category: faker.commerce.department(),
                    thumbnail: faker.image.url()
                })
                mockingProducts.push(product)
            }
            logger.info(mockingProducts.length)
            return mockingProducts
        } catch (error) {
            logger.error(error)
        }
    }


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
        if (!products) {
            return { status: 404, error: 'Error try found products', answer: products };
        }
        const dataProducts = transformDataProducts(products);
        return dataProducts;
    }

    async getProductById(pid) {
        const product = await productsModel.findById(pid);
        if (!product) {
            return { error: `The product with ID ${pid} doesn't exist`, answer: product  };
        }
        return product;
    }

    async createProduct(body, file) {
        if (file) {
            body.thumbnail = `http://localhost:8080/storage/products/${file.filename}`;
        }
        const productdto = new ProductDTO(body);
        const product = await productsModel.create(productdto);
        if (!product) {
            return { error: `Error trying create product`, answer: product };
        }
        return product;
    }

    async updateProductById(pid, body, file) {
        const dataReplace = {
            ...body,
            thumbnail: file ? `http://localhost:8080/storage/products/${file.filename}` : body.thumbnail
        };

        if (file) {
            const product = await productsModel.findById(pid);
            if (!product) {
                return { error: `Error trying find product`, answer: product };
            }
            if (product.thumbnail !== 'file') {
                const nameFile = product.thumbnail.split("/").pop();
                fs.unlinkSync(`${__dirname}/../../public/storage/products/${nameFile}`);
            }
        }

        const productdto = new ProductDTO(dataReplace);
        const productReplaced = await productsModel.findByIdAndUpdate(pid, productdto, { new: true });
        if (!productReplaced) {
            return { error: `Error trying update product`, answer: productReplaced };
        }
        return productReplaced;
    }

    async deleteProductById(id) {
        const product = await productsModel.findByIdAndDelete(id);
        if (!product) {
            return { error: `Error trying delete product`, answer: product };
        }
        if (product.thumbnail !== 'file') {
            const file = product.thumbnail.split("/").pop();
            if (file) {
                fs.unlinkSync(`${__dirname}/../../public/storage/products/${file}`);
            }
        } else {
            logger.warning("Product has no thumbnail.");
        }
        return product;
    }
}

module.exports = ProductsRepository;