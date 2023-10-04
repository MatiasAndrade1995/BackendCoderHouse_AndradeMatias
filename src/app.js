// DESAFIO ENTREGABLE -"Reestructura de nuestro servidor"
const config = require('./config')
const express = require('express')
const cors = require("cors")
const app = express()
const session = require ('express-session')
const passport = require('passport')
const { initializePassport } = require('./config/passport')
const { login } = require('./controllers/sessions')
const { addLogger, logger } = require('./config/loggerCustom')

//Swagger
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUIExpress = require('swagger-ui-express')

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación API My Comerce',
            description: 'Documentación para modulos productos y carrito',
        }
    },
    apis:[`./src/docs/**/*.yaml`]
}

const specs = swaggerJSDoc(swaggerOptions);




const MongoStore = require('connect-mongo')

app.use(cors())
app.use(addLogger)
app.use(express.json())

app.use(session({
    store: MongoStore.create({
        mongoUrl: config.urlMongo
    }),
    cookie: { maxAge: 3600000 },
    // secure: true,
    secret: config.secretBd,
    resave: true,
    saveUninitialized: true
}));


initializePassport()
app.use(passport.initialize())
app.use(passport.session())

//Http import
const http = require('http')
const server = http.createServer(app)

//Import Routes
app.use('/api', require('./routes/loggerTest'))
app.use('/api', require('./routes/products'))
app.use('/api', require('./routes/carts'))
app.use('/api', require('./routes/messages'))
app.use('/api', require('./routes/sessions'))
app.use('/api', require('./routes/mails'))
app.use('/api', require('./routes/users'))
app.use('/apidocs', swaggerUIExpress.serve, swaggerUIExpress.setup(specs))
app.get('/', login)

// app.use('/images', require('./routes/multer'))

//Import model message
const Message = require('./dao/models/messages')


//Import transformDataProducts
const {transformDataChat } = require('./utils/transformdata')


//Socket Import
const { Server } = require('socket.io')
const io = new Server(server)

//Public
app.use(express.static("public"))

//View Dependencies
const handlebars = require('express-handlebars')


//Import db
const MongoManager = require('./dao/mongodb/db.js')
const {verifyMail} = require('./utils/nodemailer')

const classMongoDb = new MongoManager(config.urlMongo);

//Views
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')


//Connection
io.on('connection', (socket) => {
    logger.info('New user connected in App')
    socket.emit('Welcome', 'Hello, welcome new user')
    socket.on('SendMessage', async (data) => {
        try {
            const prueba = await Message.create(data)
            let messages = await Message.find()
            const dataMessages = transformDataChat(messages)
            socket.emit('refreshmessages', dataMessages)
        } catch (err) {
            logger.error(err)
        }
    })
})

verifyMail()
const PORT = config.port || 3000
server.listen(PORT, () => {
    logger.http(`Server run on port http://localhost:${config.port}`)
    classMongoDb.connectionMongoDb()
})

// import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUIExpress from 'swagger-ui-express'

// const swaggerOptions = {
//     definition: {
//         openapi: "3.0.1",
//         info: {
//             title: "Documentacion API Adoptme",
//             description: "Documentacion para uso de swagger"
//         }
//     },
//     apis: [`./src/docs/**/*.yaml`]
// };
// const specs = swaggerJSDoc(swaggerOptions);
// //Declare swagger api endpoint
// app.use('/apidocs', swaggerUIExpress.serve, swaggerUIExpress.setup(specs));



// {
//     "first_name": "userTest_02",
//         "last_name": "userTest_02",
//             "email": "test@test02.com",
//                 "password": "123qwe"
// }


// components:
// schemas:
// User:
// type: object
// properties:
// _id:
// type: ObjectId
// description: Id autogenerado por MongoDB
// first_name:
// type: String
// description: Nombre del usuario
// last_name:
// type: String
// description: Apellido del usuario
// email:
// type: String
// description: Email del usuario
// password:
// type: String
// description: Contraseña del usuario
// example:
// _id: ObjectId("647fa8c9e46dbc5a20320181")
// first_name: Usuario de prueba 1
// last_name: Apellido de prueba 1
// email: correodeprueba1 @gmail.com
// password: 123456


//     / api / users / { uid }:
// get:
// summary: Obtiene un usuarios disponible en la App por ID
// tags:
// - Users
// parameters:
// - name: uid
//     in: path
// required: true
// description: id del usuario que se desea buscar
// schema:
// $type: String
// responses:
// "200":
// description: La operacion fue exitosa!!
// content:
// application / json:
// schema:
// type: array
// items:
// $ref: '#components/schemas/User'

// "400":
// description: Se envio un dato no esperado.
//         "500":
// description: Error inesperado en el server, no se pudo manejar el proceso