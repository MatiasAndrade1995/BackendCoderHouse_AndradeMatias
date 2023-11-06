//FileSystem
const fs = require('fs')
//Erros messages
const EErros = require('../errors/messages/errors-enum');
const { generateProductErrorInfo } = require('../errors/messages/user-creation-error.message');
//Custom error
const CustomError = require('../errors/customErrors');
//Product service
const { productService } = require('../services/repository/services');
//Product DTO
const ProductDTO = require('../services/dto/products.dto')

//Mocking Products
const getMockingProducts = async (req, res) => {
    try {
        const products = await productService.getMockingProducts()
        res.status(200).send(products)
    } catch (error) {
        res.status(500).send('Error generate products')
    }
}
//Create
const createProductController = async (req, res) => {
    const body = req.body;
    const file = req.files;
    const email = req.user.email
    const filename = file && file.imageProduct && file.imageProduct[0] ? file.imageProduct[0].filename : 'file';
    const baseUrl = `http://${req.get('host')}/storage/products`;
    const productDto = new ProductDTO(body);
    try {
        const result = await productService.createProduct(email, filename, baseUrl, productDto);
        if (result.ok == false) {
            return res.status(result.status).send(result.error);    
        }
        res.status(201).send(result);
    } catch (error) {
        if (file) {
            try {
                await fs.promises.unlink(`${__dirname}/../../public/storage/products/${file.filename}`);
            } catch (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
            }
        }
        console.error(error)
        res.status(500).send({error: "Internal error"});
    }
}


//Read
const getProductsController = async (req, res) => {
    const { category, status, limit, sort, page } = req.query;
    const limitQueryParams = limit || 10;
    const order = sort;
    status == "true" ? true : false;
    let products;
    try {
        products = await productService.paginateProducts(category, status, limit, sort, page, limitQueryParams, order)
        if (products.ok == false) {
            return res.status(products.status).send(products.error);
        }
        res.status(200).send(products)
    } catch (err) {
        res.status(500).send(err);
    }
};

//Read render
const getProductsControllerView = async (req, res) => {
    const { category, status, limit, sort, page } = req.query;
    const limitQueryParams = limit || 10;
    const order = sort;
    const inStock = status === "true";

    try {
        const result = await productService.paginateProducts(category, inStock, limit, sort, page, limitQueryParams, order);

        if (result.ok === false) {
            return res.status(result.status).send(result.error);
        }

        const currentPage = parseInt(page) || 1;
        const totalPages = Math.ceil(result.totalCount / limitQueryParams);
        const categories = [...new Set(result.dataProducts.map(product => product.category))];
        
        res.render('viewproducts', {
            products: result.dataProducts,
            email: req.user.email,
            firstname: req.user.first_name,
            lastname: req.user.last_name,
            rol: req.user.rol,
            cartID: req.user.cartID,
            page: currentPage,
            totalPages: totalPages,
            hasPrevPage: currentPage > 1,
            prevPage: currentPage - 1,
            hasNextPage: currentPage < totalPages,
            nextPage: currentPage + 1,
            pageNumbers: Array.from({ length: totalPages }, (_, i) => i + 1),
            categories: categories
        });
    } catch (err) {
        res.status(500).send({ error: "Internal error" });
    }
};

//Read products without paginate and render
const getProductsControllerWithoutPaginate = async (req, res) => {
    try {
        const products = await productService.getProducts()
        res.status(200).send(products)
    } catch (error) {
        res.status(500).send('Internal error')
    }

}
//Update
const updateProductController = async (req, res) => {
    const { pid } = req.params;
    const body = req.body;
    const file = req.files; 
    const baseUrl = `http://${req.get('host')}/storage/products`;
    const filename = file && file.imageProduct && file.imageProduct[0] ? file.imageProduct[0].filename : 'file';
    try {
        if (!file) return res.status(404).send('No files');
        const dataReplace = {
            ...body,
            thumbnail: filename ? `${baseUrl}/${filename}` : body.thumbnail
        };
        const productdto = new ProductDTO(dataReplace);
        const product = await productService.getProductById(pid);
        if (product.ok == true){
            const productReplaced = await productService.updateProductById(pid, productdto, filename);
            if (productReplaced.ok == true) {
                return res.status(201).send(productReplaced.data);
            } else {
                return res.status(productReplaced.status).send(productReplaced.error)
            }
        } else {
            return res.status(product.status).send(product.error);
        }
    } catch (error) {
        if (file) {
            fs.unlinkSync(`${__dirname}/../../public/storage/products/${filename}`);
        }
        res.status(500).send('Internal error');
    }
}


//Delete
const deleteProductController = async (req, res) => {
    const { pid } = req.params;
    const email = req.user.email;
    try {
        const result = await productService.deleteProductById(pid, email);
        if (result.ok == true) {
            return res.status(201).send({ ok: true, msg: result.msg });
        }
        res.status(result.status).send({ ok: false, msg: result.error });
    } catch (error) {
        res.status(500).send(error.message);
    }
}


//Read one
const getProductController = async (req, res) => {
    const { pid } = req.params
    try {
        const result = await productService.getProductById(pid)
        if (result.ok == true) {
            return res.status(200).send(result)
        } else {
            return res.status(404).send(result.error)
        }
    } catch (error) {
        res.status(500).send('Internal error')
    }
}

//Read render page for create and delete products
const getProductsControllerRealTime = async (req, res) => {
    try {
        const products = await productService.getProducts()
        res.status(200).render('realtimeproducts', {
            products: products
        })
    } catch (error) {
        res.status(500).send('Internal error')
    }
}

//Middleware validate fields product
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

const categories = async (req, res) => {
    try {
        const products = await productService.getProducts()
        const categories = [...new Set(products.map(product => product.category))];
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send('Internal error')
    }
}

const productsModel = require('../services/dao/models/products');

const updateStockTo200 = async (req, res) => {
    try {
        
        const products = await productsModel.find({});
        
        for (const product of products) {
            product.stock = 200;
            await product.save();
        }
        res.status(201).send('Stock updated successfully');
    } catch (error) {
        res.status(500).send('Internal error')
    }
};




module.exports = {
    getProductsControllerWithoutPaginate,
    getProductsController,
    getProductController,
    createProductController,
    updateProductController,
    deleteProductController,
    getProductsControllerRealTime,
    getProductsControllerView,
    getMockingProducts,
    validateFieldsProduct,
    categories,
    updateStockTo200
}