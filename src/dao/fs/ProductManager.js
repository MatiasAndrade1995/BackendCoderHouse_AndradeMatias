//Primera Pre Entrega - Andrade Matias
const fs = require('fs');
class ProductManager {

    #products

    constructor() {
        this.path = './src/dao/fs/products.json';
        this.#products = [];
    }

    getProducts = async () => {
        try {
            let res = await fs.promises.readFile(this.path, 'utf-8')
            return JSON.parse(res);
        } catch (res) {
            console.log(`Error try Read... ${JSON.stringify(this.#products, null, 2)} ------ Array empty`)
            try {
                await fs.promises.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8')
                console.log("File create")
            } catch {
                console.log("Error file create")
            }
        }
    }

    addProduct = async (title, description, price, code, stock, category, thumbnail, status = true) => {
        try {
            let res = await fs.promises.readFile(this.path, 'utf-8')
            this.#products = (JSON.parse(res));
        } catch (res) {
            console.log(`Error try read...`)
            try {
                await fs.promises.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8')
                console.log("File create")
            } catch {
                console.log("Error file create")
            }
        }
        console.log(title, description, price, code, stock, category, thumbnail, status)
        if (title === undefined || description === undefined || price === undefined || code === undefined || stock === undefined || category === undefined || typeof status !== "boolean") {
            if (typeof status !== "boolean") {
                return { error: "Status is not boolean" };
            }
            return { error: "All fields are required" };
        }
        const objectWithCode = this.#products.find(element => element.code == code)
        if (objectWithCode) {
            return { error: `ERROR... The product with this Code: ${code} already exists` };
        } else {
            const id = this.#products.length == 0 ? 1 : this.#products[this.#products.length - 1].id + 1
            this.#products.push({
                id,
                title,
                description,
                price,
                code,
                stock,
                category,
                thumbnail,
                status
            })

            const writeNewProduct = async () => {
                try {
                    await fs.promises.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8')
                    console.log("Write successfully")
                } catch {
                    console.log("Write error")
                }

            }

            await writeNewProduct();
            return {
                id,
                title,
                description,
                price,
                thumbnail,
                code,
                stock
            };
        }

    }

    updateProduct = async (id, modify) => {
        try {
            let res = await fs.promises.readFile(this.path, 'utf-8')
            this.#products = (JSON.parse(res));
            const objectWithId = this.#products.find(obj => obj.id == id)
            if (objectWithId) {
                let indexProduct = this.#products.findIndex(el => el.id == id)
                const objectModified = this.#products[indexProduct] = { ...this.#products[indexProduct], ...modify }
                console.log(objectModified)
                await fs.promises.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8')
                return (objectModified);
            } else {
                return { error: `The ID ${id} no exists...` }
            }
        } catch (res) {
            return { error: "This file doesn´t exist" }
        }
    };

    getProductById = async (id) => {
        try {
            let res = await fs.promises.readFile(this.path, 'utf-8')
            this.#products = (JSON.parse(res));
            const objectWithId = this.#products.find(obj => obj.id == id)
            if (objectWithId) {
                return objectWithId;
            } else {
                return { error: "Not found product" }
            }
        } catch (res) {
            return { error: "This file doesn´t exist" }
        }
    }

    deleteProduct = async (id) => {
        try {
            let res = await fs.promises.readFile(this.path, 'utf-8')
            this.#products = (JSON.parse(res));
            const objectWithId = this.#products.find(obj => obj.id == id)
            if (objectWithId) {
                let dataFile = [];
                let data = await fs.promises.readFile(this.path, 'utf-8')
                if (!data) {
                    console.log('Error try read')
                } else {
                    dataFile = JSON.parse(data)
                    dataFile = dataFile.filter((obj) => {
                        return obj.id != id
                    })
                    await fs.promises.writeFile(this.path, JSON.stringify(dataFile, null, 2), 'utf-8')
                    return dataFile
                }
            } else {
                return { error: `The ID ${id} no exists..` }
            }
        } catch (res) {
            return { error: "This file doesn´t exist" }
        }

    }
}

module.exports = ProductManager;