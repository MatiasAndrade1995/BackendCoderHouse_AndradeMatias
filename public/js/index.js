const socket = io()

socket.on('Welcome', (data) => {
    console.log(data)
})

async function captureValueId() {
    let select = document.getElementById("options");
    const pid = select.value;
    console.log(`Intentando eliminar el producto ${pid}`)
    try {
        const resDeleted = await fetch(`/api/products/${pid}`, {
            method: 'DELETE'
        });
        const resDeletedData = await resDeleted.json()
        if (!resDeletedData.ok) {
            throw new Error(resDeletedData.msg); 
        }
        const resGetProducts = await fetch('/api/allProducts', {
            method: 'GET'
        });

        if (!resGetProducts.ok) {
            throw new Error('Error al obtener los productos'); 
        }
        const productsData = await resGetProducts.json();
        let htmlProducts = productsData.map(obj => `<p class="text-center products"> ${obj.title}</p>`).join(' ');
        document.getElementById('products').innerHTML = htmlProducts;
        let htmlProductsInMenu = productsData.map(obj => `<option value="${obj.id}">${obj.title}</option>`).join(' ');
        document.getElementById('options').innerHTML = htmlProductsInMenu;
        console.log(resDeletedData.msg + `${pid}`)
    } catch (error) {
        console.log(error.message);
    }
}

async function handlesubmit(event) {
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
    try {
        const resCreated = await fetch("/api/products", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });

        if (!resCreated.ok) {
            const errorResponse = await resCreated.json();
            throw new Error(errorResponse.error || 'Failed to create product');
        }

        const resGetProducts = await fetch('/api/allProducts', {
            method: 'GET'
        });

        if (!resGetProducts.ok) throw new Error('Failed to get products');

        const productsData = await resGetProducts.json();

        let htmlProducts = productsData.map(obj => `<p class="text-center products"> ${obj.title}</p>`).join(' ');
        document.getElementById('products').innerHTML = htmlProducts;

        let htmlProductsInMenu = productsData.map(obj => `<option value="${obj.id}">${obj.title}</option>`).join(' ');
        document.getElementById('options').innerHTML = htmlProductsInMenu;
        const message = document.getElementById('message')
        message.textContent = `Se agregó con éxito el producto ${productsData[productsData.length - 1].title}`;
        setTimeout(() => {
            message.textContent = ""
        }, 3000)
    } catch (error) {
        console.log(error);
        const errorMessage = error.message || 'Error desconocido';
        const message = document.getElementById('message');
        message.textContent = errorMessage;
        setTimeout(() => {
            message.textContent = '';
        }, 3000);
    }
}


function loadCart() {
    event.preventDefault()
    const cartID = document.querySelector('input[name="cartID"]').value;
    socket.emit('requestloadcart', cartID)
}

() => {

    const formUrl = `/api/carts/${cartID}`;
    const htmlForm = `
        <form action="${formUrl}" method="get" class="d-flex justify-content-center">
            <button class="mb-4 btn btn-primary" type="submit">See my cart</button>
        </form>
    `;
    document.getElementById('myFormContainer').innerHTML = htmlForm;
}



async function captureValueIdProduct(pid, title) {
    let cartID = document.querySelector('#userEmail').getAttribute('data-cartid');
    console.log(`Trying to add product to Cart: ${title}`);
    const quantity = 1;
    try {
        const resAddProduct = await fetch(`/api/carts/${cartID}/products/${pid}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ quantity: quantity })
        });
        const resAddProductData = await resAddProduct.json()
        if (!resAddProductData.ok) throw new Error(resAddProductData.msg); 
        console.log(resAddProductData.msg)
    } catch (error) {
        console.log(error.message);
    }
}

function deleteProductCart(pid) {
    let cartID = document.querySelector('#userEmail').getAttribute('data-cartid');
    console.log(`Trying delete product in Cart : ${cartID}`)
    fetch(`/api/carts/${cartID}/products/${pid}`, {
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
            console.log(data)
            const productsCart = data.products
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
    let cartID = document.querySelector('#userEmail').getAttribute('data-cartid');
    console.log(`Trying delete product in Cart : ${cartID}`)

    fetch(`/api/carts/${cartID}`, {
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

function purchaseCart() {
    let cartID = document.querySelector('#userEmail').getAttribute('data-cartid');
    console.log(`Trying finish Cart : ${cartID}`);
    fetch(`/api/carts/${cartID}/purchase`, {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            const productsCart = data[1].products
            if (productsCart.length <= 0) {
                let htmlProductsInCart = `<div ><h2 class="text-center">This cart is empty.</h2></div>`
                document.getElementById("boxProductsCart").innerHTML = htmlProductsInCart;
            } else {
                let htmlProductsInCart = productsCart.map(obj => `<div ><h3 class="p-1">${obj.product.title} : Quantity - ${obj.quantity}</h3></div><input type="submit" class="mb-4 btn btn-danger" value="Delete" onclick="deleteProductCart('${obj.product._id}')"></input>`).join(' ');
                document.getElementById("boxProductsCart").innerHTML = htmlProductsInCart;    
            }
            const ticket = document.getElementById('ticket');
            ticket.textContent = "Ticket:\n";
            const ticketData = data[0];
            ticket.innerHTML +=
                `<div class="ticket">
                        <p class="line">Code: ${ticketData.code}</p>
                        <p class="line">Date: ${ticketData.purchaser_datetime}</p>
                        <p class="line">Amount: $${ticketData.amount}</p>
                        <p class="line">Purchaser: ${ticketData.purchaser}</p>
                        <p class="line">ID: ${ticketData._id}</p>
                    </div>`;


            setTimeout(() => {
                ticket.textContent = "";
            }, 10000);
        })
        .catch(error => console.error('Error:', error.message));
}