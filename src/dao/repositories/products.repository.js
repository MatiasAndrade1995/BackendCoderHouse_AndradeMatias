const productsModel = require('../models/products');
const ProductDTO = require('../dto/products.dto');
const fs = require('fs');
const { transformDataProducts } = require('../../utils/transformdata');
const { faker } = require("@faker-js/faker");
const { logger } = require('../../config/loggerCustom');
const User = require('../models/users');
const { formNewUser } = require('../../controllers/sessions');

class ProductsRepository {
    constructor() {}

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
        const dataProducts = transformDataProducts(products);
        return dataProducts;
    }

    async getProductById(pid) {
        const product = await productsModel.findById(pid);
        if (!product) {
            return { ok: false, error: `The product with ID ${pid} doesn't exist`};
        }
        return { ok: true, product };
    }

    async createProduct(email, body, file) {
        if (file) {
            body.thumbnail = `http://localhost:8080/storage/products/${file.filename}`;
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return { ok: false, status: 404, error: `User with email ${email} not found`};
        }
        let product; 

        if (user.rol.includes('premium')) {
            const productdto = new ProductDTO(body);
            productdto.owner = email;
            product = await productsModel.create(productdto); 
            if (!product) {
                return { ok: false, status: 500, error: `Error trying to create product`};
            }
        } else {
            return { ok: false, status: 403, error: `User with email ${email} is not premium`};
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
                return { ok: false, error: `Error trying find product`,  status: 404};
            }
            if (product.thumbnail !== 'file') {
                const nameFile = product.thumbnail.split("/").pop();
                fs.unlinkSync(`${__dirname}/../../public/storage/products/${nameFile}`);
            }
        }

        const productdto = new ProductDTO(dataReplace);
        const productReplaced = await productsModel.findByIdAndUpdate(pid, productdto, { new: true });
        if (!productReplaced) {
            return { ok: false, error: `Error trying update product`,status: 406 };
        }
        return { ok: true, data: productReplaced };
    }

    async deleteProductById(id, email) {
        const user = await User.findOne({ email: email });
        const product = await productsModel.findById(id);
        const productOwner = product.owner;
        if (!user) {
            return { error: `Error  user not found`};
        }
        if (!product) {
            return { error: `Error product not found`};
        }
        if (!user.rol.includes('admin') && email !== productOwner) {
            return { error: `Access denied for deleted product`};
        }
        const productDeleted = await productsModel.findByIdAndDelete(id);
        if (!productDeleted) {
            return { error: `Error trying delete product` };
        }
        if (product.thumbnail !== 'file') {
            const file = product.thumbnail.split("/").pop();
            if (file) {
                fs.unlinkSync(`${__dirname}/../../public/storage/products/${file}`);
            }
        } else {
            logger.warning("Product has no thumbnail.");
        }
        return { msg: `Product deleted...` }
    }
}

module.exports = ProductsRepository;