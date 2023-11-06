const chai = require('chai');
const supertest = require('supertest');
const expect = chai.expect;
const requester = supertest('http://localhost:8080');
const Assert = require('assert')

describe('Testing My App', () => {
    describe('Testing api/sessions', () => {
        //Test 01
        it('Test Login: Must be redirect self page without session', async function () {

            //Given
            this.timeout(5000)
            let user = {
                email: 'matiasandrade.unla@gmail.com',
                password: '123456bB'
            }

            //Then
            const { statusCode, redirect, header } = await requester.post('/api/login').send(user);

            //Assert that
            expect(statusCode).to.equal(302)// Response found, redirect request.
            expect(redirect).to.equal(true);
            expect(header.location).to.equal('/');
        })

        //Test 02
        it('Test recoverypassword :  Must be render page recoverypass', async function () {

            //Given
            this.timeout(3000)

            //Then
            const { status, ok, error } = await requester.get('/api/recoveryPassword').send();

            //Assert that
            expect(status).to.equal(200);
            expect(ok).to.equal(true);
            expect(error).to.equal(false);
        })

        //Test 03
        it('Test send recoverpass: Must be send a email with token for reset password', async function () {

            //Given
            this.timeout(5000)
            let user = {
                email: 'matiasandrade.unla@gmail.com'
            }

            //Then
            const { statusCode, ok, error } = await requester.post('/api/sendrecoverpass').send(user);

            //Assert that
            expect(statusCode).to.equal(201);
            expect(ok).to.equal(true);
            expect(error).to.equal(false);
        })
    })

    describe('Testing api/products', () => {

        before(function () {
            this.pid = '6548a4787ce75ad3a3dd67c2'
            
        })
        it('Test getProductsControllerView: Must be obtain all products respecting a query params indicated', async function () {
            //Given
            this.timeout(3000)
           
            //Then
            let { statusCode, ok, error, _body } = await requester.get('/api/productsDetail').query({ limit: 10, status: true, sort: 1 }) 

            //Assert that
            expect(statusCode).to.equal(200);
            expect(ok).to.equal(true);
            expect(error).to.equal(false);
        })

        it('Test updateProductController: Must be return 404 because not have file', async function () {
            //Given
            this.timeout(3000)
            const mockProduct = {
                title: 'Test product',
                description: 'Test product',
                code: '123456',
                price: 500,
                status: true,
                stock: 10,
                category: 'Test',
                thumbnail: 'file'
            }
            
            //Then
            const { statusCode, ok} = await requester.put(`/api/products/${this.pid}`).send(mockProduct);
            

            //Assert that
            expect(statusCode).to.equal(404);
            expect(ok).to.equal(false);
        })


        it('Test getProductController: Must be obtain a product specific for his pid', async function () {
        
        //Given
        this.timeout(3000)

        //Then
            const { statusCode, error, _body } = await requester.get(`/api/productsTest/${this.pid}`)
            
    
        //Assert that
        expect(error).to.equal(false);    
        expect(statusCode).to.equal(200);    
        expect(_body).to.be.an('object');
        expect(_body).to.have.property('ok').and.to.be.deep.equal(true)
        expect(_body.product).to.have.property('_id').and.to.be.deep.equal(this.pid)
        })

})
    
    describe('Testing api/carts', () => {

        before(function () {
            this.cid = '6548b7af25085f031c73f448'
            this.pid = '6548a47a7ce75ad3a3dd67dc'    
        })

        it('Test creatCartController: Must create a new cart', async function () {
            // Given
            this.timeout(3000);
            const cart = {
                name: 'New cart test',
                products: []
            }

            // Then
            const { ok, statusCode, _body } = await requester.post('/api/cartsTest/')

            // Assert that
            expect(statusCode).to.equal(201);
            expect(_body).to.be.an('object');
            expect(_body).to.have.property('_id')
            expect(_body).to.have.property('products').and.to.be.an('array')
        })
            
        it('Test getCartsController: Must be obtain all carts', async function () {
            // Given
            this.timeout(3000);

            // Then
            const { ok, statusCode, _body } = await requester.get('/api/carts');

            // Assert that
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(_body).to.be.an('array'); 
            
        })

        
        
        //INGRESO AL CART - email: 'matiasandrade.av@gmail.com' - password: '123456aA -  producto : {id : 6548a47a7ce75ad3a3dd67dc, title: Incredible Rubber Shoes} agregarlo de nuevo para volver a probar'

        it('Test deleteProductSelectedCartController: Must be obtain delete product specific with query params indicated', async function () {
            //Given
            this.timeout(3000)

            //Then
            const { statusCode, ok, _body } = await requester.delete(`/api/cartsTest/${this.cid}/products/${this.pid}`)

            //Assert that
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(201);
            expect(_body).to.be.an('object');
            expect(_body).to.have.property('_id').and.to.be.deep.equal(this.cid)
            expect(_body.products).to.be.an('array');
            const isProductNotFound = _body.products.length === 0 || !_body.products.every(product => product._id === this.pid);
            expect(isProductNotFound).to.equal(true);
        })
            
        it('Test purchaseCart: Must be close a cart specific with query params indicated and return a ticket with all dates about off buy', async function () {
            //Given
            this.timeout(3000)

            //Then
            const { statusCode, ok, _body } = await requester.post(`/api/carts/${this.cid}/purchase`)

            //Assert that
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(201);
            expect(_body).to.be.an('array');
            expect(_body[0]).to.have.property('code')
            expect(_body[0]).to.have.property('purchaser')
            expect(_body[1]).to.have.property('_id').and.to.be.deep.equal(this.cid)
            expect(_body[1]).to.have.property('products').and.to.be.an('array')
        })
    })
        
});
    