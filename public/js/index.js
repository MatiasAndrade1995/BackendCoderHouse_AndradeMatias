const socket = io()

socket.on('Welcome', (data) => {
    console.log(data)
})

socket.on('refreshproducts', (data) => {
    renderUpdateProducts(data)
    renderUpdateProductsMenu(data)

})

socket.on('answer', (data) => {
    showAnswer(data)
})

function showAnswer(data) {
    const message = document.getElementById('message')
    message.textContent = data.error ? data.error : `Se agrego con exito el producto ${data.title}`
    setTimeout(() => {
        message.textContent = ""
    }, 3000)
}

function renderUpdateProducts(data) {
    let htmlProducts = data.map(obj => `<p class="text-center products"> ${obj.title}</p>`).join(' ')
    document.getElementById('products').innerHTML = htmlProducts
}

function renderUpdateProductsMenu(data) {
    let htmlProductsInMenu = data.map(obj => `<option value="${obj.id}">${obj.title}</option>`).join(' ')
    document.getElementById('options').innerHTML = htmlProductsInMenu
}

function captureValueId() {
    let select = document.getElementById("options");
    const product = { id: select.value, }
    socket.emit('productDeleted', product)
    return false
}

function handlesubmit(event) {
    event.preventDefault()
    const form = document.getElementById('formAddProduct')
    const inputTrue = document.getElementById('newProductStatusTrue')

    let valueInputRadio;

    if (inputTrue.checked) {
        valueInputRadio = true
    } else {
        valueInputRadio = false
    }

    const product = {
        title: form.inputProductTitle.value,
        description: form.inputProductDescription.value,
        code: form.inputProductCode.value,
        price: form.inputProductPrice.value,
        status: valueInputRadio,
        stock: form.inputProductStock.value,
        category: form.inputProductCategory.value,
        thumbnail: "file" //form.inputFile.files[0]
    }
    socket.emit('productAdd', product)
}
function creatCart() {
    socket.emit('requestnewcart', 'User request a new cart...')
}
function loadCart() {
    event.preventDefault()
    const cartID = document.querySelector('input[name="cartID"]').value;
    socket.emit('requestloadcart', cartID)
}

let newCart

socket.on('requestcartok', (data) => {
    console.log(`Cart ID ${data._id} loaded...`);
    newCart = data._id;
    document.cookie = newCart;
    const formUrl = `/api/carts/${newCart}`;
    const htmlForm = `
        <form action="${formUrl}" method="get" class="d-flex justify-content-center">
            <button class="mb-4 btn btn-primary" type="submit">See my cart</button>
        </form>
    `;
    document.getElementById('myFormContainer').innerHTML = htmlForm;
});

async function captureValueIdProduct(pid) {
    if (newCart == undefined) {
        newCart = document.cookie
        console.log(`Trying add product in Cart : ${newCart}`)
    } else {
        console.log(`Trying add product in Cart : ${newCart}`)
    }
    const quantity = 1;
    try {
        const res = await fetch(`carts/${newCart}/products/${pid}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify({quantity: quantity })
        })
        if (!res.ok) throw res
        const json = await res.json()
        const formUrl = `/api/carts/${newCart}`;
        const htmlForm = `
        <form action="${formUrl}" method="get" class="d-flex justify-content-center">
            <button class="mb-4 btn btn-primary" type="submit">See my cart</button>
        </form>
    `;
        document.getElementById('myFormContainer').innerHTML = htmlForm;
    } catch (e) {
        console.log(e)
    }

}

 // socket.emit('requestproduct', (requestProduct))



function deleteProductCart(pid) {
    if (newCart == undefined) {
        newCart = document.cookie
        console.log(`Trying delete product in Cart : ${newCart}`)
    } else {
        console.log(`Trying delete product in Cart : ${newCart}`)
    }
    fetch(`/api/carts/${newCart}/products/${pid}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error try delete cart');
            }
        })
        .then(data => {
            console.log(data.res.products)
            const productsCart = data.res.products
            if (productsCart.length <= 0) {
                let htmlProductsInCart = `<div ><h2 class="text-center">This cart is empty.</h2></div>`
                document.getElementById("boxProductsCart").innerHTML = htmlProductsInCart;
            } else {
                let htmlProductsInCart = productsCart.map(obj => `<div ><h3 class="p-1">${obj.product.title} : Quantity - ${obj.quantity}</h3></div><input type="submit" class="mb-4 btn btn-danger" value="Delete" onclick="deleteProductCart('${obj.product._id}')"></input>`).join(' ');
                document.getElementById("boxProductsCart").innerHTML = htmlProductsInCart;
            }
        })
        .catch(error => console.log('Error:', error));     
}

function deleteAllProductCart(pid) {
    if (newCart == undefined) {
        newCart = document.cookie
        console.log(`Trying delete product in Cart : ${newCart}`)
    } else {
        console.log(`Trying delete product in Cart : ${newCart}`)
    }
    fetch(`/api/carts/${newCart}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error try delete cart');
            }
        })
        .then(data => console.log('All products delete'))
        .catch(error => console.log('Error:', error));
        let htmlProductsInCart = `<div ><h2 class="text-center">This cart is empty.</h2></div>`
        document.getElementById("boxProductsCart").innerHTML = htmlProductsInCart;
}