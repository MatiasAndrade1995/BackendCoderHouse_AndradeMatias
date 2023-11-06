//Transformdata
const { transformDataProducts } = require('../../../utils/transformdata');
//Models
const productsModel = require('../models/products');
const userModel = require('../models/users');
//Fs
const fs = require('fs')
//LoggerCustom
const { logger } = require('../../../config/loggerCustom');
//NodeMailer
const { deleteProductMail } = require('../../../utils/nodemailer');
//Faker
const { faker } = require("@faker-js/faker");


class ProductsMongo {

    constructor() { 
        logger.info("Working products with Database persistence in mongodb");
    }

    paginateProducts = async (category, status, limit, sort, page, limitQueryParams, order) => {
        let query = {};
        if (category || status) {
            query = { $or: [{ category: category }, { status: status }] };
        }

        const skip = (page - 1) * limitQueryParams;

        const products = await productsModel.find(query)
            .sort({ price: order })
            .skip(skip)
            .limit(limitQueryParams);

        if (!products) {
            return { ok: false, status: 404, error: `Error trying to find products` };
        }

        const totalCount = await productsModel.countDocuments(query);
        const dataProducts = transformDataProducts(products);

        return {
            ok: true,
            dataProducts,
            totalCount,
        };
    };

    getProducts = async () => {
        const products = await productsModel.find();
        const dataProducts = transformDataProducts(products);
        return dataProducts;
    }

    
    getProductById = async (pid) => {
        const product = await productsModel.findById(pid);
        if (!product) {
            return { ok: false, error: `The product with ID ${pid} doesn't exist` };
        }
        return { ok: true, product };
    }

    createProduct = async (email, filename, baseUrl, productDto) => {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return { ok: false, status: 404, error: `User with email ${email} not found` };
        }
        let product;
        if (user.rol.includes('premium') || user.rol.includes('admin')) {
            productDto.owner = email;
            productDto.thumbnail = `${baseUrl}/${filename}`
            product = await productsModel.create(productDto);
            if (!product) {
                return { ok: false, status: 500, error: `Error trying to create product` };
            }
        } else {
            return { ok: false, status: 403, error: `User with email ${email} is not premium` };
        }
        return product;
    }
    
    updateProductById = async (pid, productdto, filename) => {   
        if (filename) {
            const product = await productsModel.findById(pid);
            if (!product) {
                return { ok: false, error: `Error trying to find product`, status: 404 };
            }
            if (product.thumbnail !== 'file') {
                const nameFile = product.thumbnail.split("/").pop();
                try {
                    fs.unlinkSync(`${__dirname}../../../../../public/storage/products/${nameFile}`);

                } catch (error) {
                    if (error.code === 'ENOENT') {
                        logger.warning(`File ${nameFile} not found in storage`);
                    } else {
                        return { ok: false, error: `Ocurrió un error al eliminar el archivo: ${error.message}`, status: 500 }
                    }
                }
            }
        }

        const productReplaced = await productsModel.findByIdAndUpdate(pid, productdto, { new: true });
        if (!productReplaced) {
            return { ok: false, error: `Error trying update product`, status: 406 };
        }
        return { ok: true, data: productReplaced };
    }

    deleteProductById = async (pid, email) => {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return { ok: false, status: 404, error: `Error  user with email ${email} not found` };
        }
        const product = await productsModel.findById(pid);
        if (!product) {
            return { ok: false, status: 404, error: `Error product with id ${pid} not found` };
        }
        const productOwner = product.owner;
        if (!user.rol.includes('admin') && email !== productOwner) {
            return { ok: false, status: 403, error: `Access denied for deleted product` };
        }

        const productDeleted = await productsModel.findByIdAndDelete(pid);


        if (!productDeleted) {
            return { ok: false, status: 400, error: `Error trying delete product` };
        }

        //Send mail if is not a admin
        if (!user.rol.includes('admin')) {
            deleteProductMail(productOwner)
        }

        if (product.thumbnail !== 'file') {
            const nameFile = product.thumbnail.split("/").pop();
            try {
                fs.unlinkSync(`${__dirname}../../../../../public/storage/products/${nameFile}`);

            } catch (error) {
                if (error.code === 'ENOENT') {
                    logger.warning(`File ${nameFile} not found in storage`);
                } else {
                    return { ok: false, error: `It occurred an error when deleting the file: ${error.message}`, status: 500 }
                }
            }
        }

        return { ok: true, msg: `Product has been deleted...` }
    }

    getMockingProducts = async () => {
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
}

module.exports = ProductsMongo;