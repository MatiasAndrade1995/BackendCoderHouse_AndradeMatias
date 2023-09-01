const Products = require('../dao/mongodb/products.mongo')
const fs = require('fs')
const productService = new Products()

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
    try {
        const product = await productService.createProduct(body, file);
        res.status(201).send(product);
    } catch (err) {
        if (file) {
            try {
                await fs.promises.unlink(`${__dirname}/../../public/storage/products/${file.filename}`);
            } catch (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
            }
        }

        if (err.error) {
            return res.status(404).send(err);
        }

        let errorMessage = 'An error occurred';
        if (err.errors) {
            errorMessage = err.message;
        } else {
            errorMessage = 'Title or code already exists in the database';
        }
        res.status(404).send({ error: errorMessage });
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
    const { pid } = req.params
    try {
        await productService.deleteProductById(pid)
        res.status(201).send({ message: 'Delete succefully' })
    } catch (error) {
        res.status(500).send({ true: false, msg: error })
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

module.exports = { getProductsControllerWithoutPaginate, getProductsController, getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime, getProductsControllerView }