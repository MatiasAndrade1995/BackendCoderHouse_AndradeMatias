const ProductManager = require("../dao/fs/ProductManager")
const productManager = new ProductManager();


const getProductsController = async (req, res) => {
    
    let { limit } = req.query
    const products = await productManager.getProducts()
    if (limit) {
        if (limit >= products.length || limit < 0) {
            res.send(products)
        } else {
            res.send(products.slice(0, limit))
        }
    } else {
        res.render('home', {
            products: products
        })
    }
}

const getProductsControllerRealTime = async (req, res) => {
    let { limit } = req.query
    const products = await productManager.getProducts()
    if (limit) {
        if (limit >= products.length || limit < 0) {
            res.render('realtimeproducts', {
                products: products
            })
        } else {
            res.render('realtimeproducts', {
                products: products.slice(0, limit)
            })
        }
    } else {
        res.render('realtimeproducts', {
            products: products
        })
    }
    return products;
}



const getProductController = async (req, res) => {
    const { pid } = req.params
    const product = await productManager.getProductById(pid)
    if (product) {
        res.send(product)
    } else {
        res.status(404)
        res.send({ error: "Not found" })
    }
}

const createProductController = async (req, res) => {
    const body = req.body;
    const resaddProduct = await productManager.addProduct(body.title, body.description, body.price, body.code, body.stock, body.category, body.thumbnail, body.status)
    res.send(resaddProduct)
}

const updateProductController = async (req, res) => {
    const { pid } = req.params
    const returnGetProductById = await productManager.getProductById(pid)
    const body = req.body
    if (returnGetProductById) {
        const resUpdateProduct = await productManager.updateProduct(pid, body)
        res.send(resUpdateProduct);
    } else {
        res.status(404)
        res.send(returnGetProductById)
    }
}

const deleteProductController = async (req, res) => {
    const { pid } = req.params
    const returnDeleteProduct = await productManager.deleteProduct(pid)
    if (returnDeleteProduct.error) {
        res.status(404)
        res.send(returnDeleteProduct)
    } else {
        res.send(returnDeleteProduct)
        res.render('realtimeproducts', {
            products: products
        })
    }
}


 

module.exports = { getProductsController, getProductController, createProductController, updateProductController, deleteProductController, getProductsControllerRealTime }