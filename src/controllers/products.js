const Products = require('../dao/mongodb/products.mongo')
const fs = require('fs')
const EErros = require('../errors/messages/errors-enum');
const { generateProductErrorInfo, generateProductErrorInfoUnique } = require('../errors/messages/user-creation-error.message');
const CustomError = require('../errors/customErrors');
const productService = new Products()

const getMockingProducts = async (req, res) => {
    try {
        const products = await productService.getMockingProducts()
        res.status(200).send(products)
    } catch (error) {
        res.status(500).send(error)
    }
}


//CREATE
const getProductsControllerWithoutPaginate = async (req, res) => {
    try {
        const products = await productService.getProducts()
        res.status(200).send(products)
    } catch (error) {
        res.status(500).send(error)
    }

}

const createProductController = async (req, res) => {
    const body = req.body;
    const file = req.file;
    const email = req.user.email
    try {
        const product = await productService.createProduct(email, body, file);
        res.status(201).send(product);
    } catch (error) {
        if (file) {
            try {
                await fs.promises.unlink(`${__dirname}/../../public/storage/products/${file.filename}`);
            } catch (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
            }
        }

        console.error(error)
        res.status(500).send({error: "Error to try create product"});
    }
}


//READ
const getProductsController = async (req, res) => {
    const { category, status, limit, sort, page } = req.query;
    const limitQueryParams = limit || 10;
    const order = sort;
    status == "true" ? true : false;
    let products;
    try {
        products = await productService.createProduct(category, status, limit, sort, page, limitQueryParams, order)
        res.status(200).send(products)
    } catch (err) {
        res.status(500).send({ error: 'Error reading filter' });
    }
};

const getProductsControllerView = async (req, res) => {
    const { category, status, limit, sort, page } = req.query;
    const limitQueryParams = limit || 10;
    const order = sort;
    status == "true" ? true : false;
    try {
        const dataProducts = await productService.paginateProducts(category, status, limit, sort, page, limitQueryParams, order)
        res.status(200).render('viewproducts', {
            products: dataProducts,
            email: req.user.email,
            firstname: req.user.first_name,
            lastname: req.user.last_name,
            rol: req.user.rol,
            cartID: req.user.cartID
        })
    } catch (err) {
        res.status(500).send({ error: 'Error reading products indicate' });
    }
};

//UPDATE
const updateProductController = async (req, res) => {
    const { body, file } = req;
    const { pid } = req.params;
    try {
        const product = await productService.getProductById(pid);
        if (product) {
            const productReplaced = await productService.updateProductById(pid, body, file);
            res.status(201).send(productReplaced);
        } else {
            throw { error: 'Not exist' };
        }
    } catch (error) {
        if (file) {
            fs.unlinkSync(`${__dirname}/../../public/storage/products/${file.filename}`);
        }
        res.status(404).send(error);
    }
};

//DELETE
const deleteProductController = async (req, res) => {
    const { pid } = req.params;
    const email = req.user.email;
    try {
        const answer = await productService.deleteProductById(pid, email);
        if (answer.error) {
            return res.status(404).send({ ok: false, msg: answer.error });
        }
        res.status(201).send({ ok: true, msg: answer.msg });
    } catch (error) {
        res.status(500).send({ ok: false, msg: error.message }); // Cambio aquí
    }
}


//READ ONE
const getProductController = async (req, res) => {
    const { pid } = req.params
    try {
        const product = await productService.getProductById(pid)
        res.status(200).send(product)
    } catch (error) {
        res.status(404).send(error)
    }
}

const getProductsControllerRealTime = async (req, res) => {
    try {
        const products = await productService.getProducts()
        res.render('realtimeproducts', {
            products: products
        })
    } catch (error) {
        res.render('realtimeproducts', {
            error: 'Error'
        })
    }
}

const validateFieldsProduct = (req, res, next) => {
    try {
        const {title, description, code, price, stock, category} = req.body
        const isEmptyOrSpaces = (str) => {
            return str === null || str.match(/^ *$/) !== null;
        };

        if (
            isEmptyOrSpaces(title) ||
            isEmptyOrSpaces(description) ||
            isEmptyOrSpaces(code) ||
            isEmptyOrSpaces(price) ||
            isEmptyOrSpaces(stock) ||
            isEmptyOrSpaces(category)
        ) {
            CustomError.createError({
                name: "Product creation error",
                cause: generateProductErrorInfo({
                    title,
                    description,
                    code,
                    price,
                    stock,
                    category
                }),
                message: "Error to create product",
                code: EErros.INVALID_TYPES_ERROR
            });
        }

        next();

    } catch (error) {
        console.error(error);
        res.status(404).send({ error: error.message });
    }
}





// const backup = async (req, res) => {
//     const body = req.body;
//     const file = req.file;
//     try {
//         const product = await productService.createProduct(body, file);
//         res.status(201).send(product);
//     } catch (err) {
//         if (file) {
//             fs.unlinkSync(`${__dirname}/../../public/storage/products/${file.filename}`);
//         }
//         if (err.error) {
//             res.status(404).send(err);
//         } else {
//             if (err.errors) {
//                 res.status(404).send({ error: err.message });
//             } else {
//                 res.status(404).send({ error: 'Title or code already exists in the database' });
//             }
//         }
//     }
// }

module.exports = { getProductsControllerWithoutPaginate, getProductsController, getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime, getProductsControllerView, getMockingProducts, validateFieldsProduct }