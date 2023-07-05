const ProductManager = require("../dao/fs/ProductManager")
const productManager = new ProductManager();
const Product = require('../dao/models/products');
const fs = require('fs')
const { transformDataProducts } = require('../utils/transformdata');
const mongoosePaginate = require('mongoose-paginate-v2');


//CREATE
const createProductController = async (req, res) => {
    const body = req.body;
    const file = req.file
    const data = {
        ...body, thumbnail: `http://localhost:8080/storage/products/${file.filename}`
    }
    try {
        const product = await Product.create(data)
        res.status(201).send(product)
    } catch (err) {
        fs.unlinkSync(`${__dirname}/../../public/storage/products/${file.filename}`);
        if (err.error) {
            res.status(404).send(err)
        } else {
            if (err.errors) {
                res.status(404).send({ error: err.message })
            } else {
                res.status(404).send({ error: 'Title or code already be declared in databases' })
            }
        }
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
        if (category || status) {
            products = await Product.paginate({ $or: [{ category: category }, { status: status }] }, {
                limit: limitQueryParams,
                sort: { price: order },
                page: page || 1
            });
        } else {
            products = await Product.paginate({}, {
                limit: limitQueryParams,
                sort: { price: order },
                page: page || 1
            });
        }
        res.status(200).send(products)
    } catch (err) {
        res.status(500).send({ error: 'Error reading filter' });
    }
};

const getProductsControllerView = async (req, res) => {
    const { category, status, limit, sort, page} = req.query;
    const limitQueryParams = limit || 10;
    const order = sort;
    status == "true" ? true : false;
    let products;
    try {
        if (category || status) {
            products = await Product.paginate({ $or: [{ category: category }, { status: status }] }, {
                limit: limitQueryParams,
                sort: { price: order },
                page: page || 1
            });
        } else {
            products = await Product.paginate({}, {
                limit: limitQueryParams,
                sort: { price: order },
                page: page || 1
            });
        }
        const dataProducts = transformDataProducts(products.docs)

            res.status(200).render('viewproducts', {
                products: dataProducts,
                email: req.session.email,
                firstname: req.session.first_name,
                lastname: req.session.last_name,
                rol: req.session.rol,
                cart:'hola'
            })

    } catch (err) {
        res.status(500).send({ error: 'Error reading products indicate' });
    }
};

//UPDATE
const updateProductController = async (req, res) => {
    const { body, file } = req
    const { pid } = req.params
    try {
        const product = await Product.findById(pid)
        if (product) {
            const dataReplace = {
                ...body, thumbnail: file ? `http://localhost:8080/storage/products/${file.filename}` : body.thumbnail
            }
            if (file) {
                const nameFile = product.thumbnail.split("/").pop() // Refiere al último separador que es ${file.filename}
                fs.unlinkSync(`${__dirname}/../../public/storage/products/${nameFile}`)
            }
            const productReplaced = await Product.findByIdAndUpdate(pid, dataReplace, { new: true })
            res.status(201).send(productReplaced)
        } else {
            throw { error: 'Not exist' }
        }
    } catch (error) {
        if (file) { fs.unlinkSync(`${__dirname}/../../public/storage/products/${file.filename}`) }
        console.log(error)
        res.status(404).send(error)
    }
}

//DELETE
const deleteProductController = async (req, res) => {
    const { pid } = req.params
    try {
        const product = await Product.findByIdAndDelete(pid)
        const file = product.thumbnail.split("/").pop()
        fs.unlinkSync(`${__dirname}/../../public/storage/products/${file}`)
        if (!product) {
            throw { error: `The product with ID ${pid} doesnt exist` }
        }
        res.status(201).send({ message: 'Delete succefully' })
    } catch (error) {
        res.status(404).send(error)
    }
}

//READ ONE
const getProductController = async (req, res) => {
    const { pid } = req.params
    try {
        const product = await Product.findById(pid)
        if (!product) {
            throw { error: `The product with ID ${pid} doesnt exist` }
        }
        res.status(200).send(product)
    } catch (error) {
        res.status(404).send(error)
    }
}

const getProductsControllerRealTime = async (req, res) => {
    try {
        const products = await Product.find()
        const dataProducts = transformDataProducts(products)
        res.render('realtimeproducts', {
            products: dataProducts
        })
    } catch (error) {
        res.render('realtimeproducts', {
            error: 'Error'
        })
    }
}

module.exports = { getProductsController, getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime, getProductsControllerView }