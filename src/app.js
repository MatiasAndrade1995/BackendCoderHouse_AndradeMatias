// ENTREGA FINAL
const config = require('./config')
const express = require('express')
const cors = require("cors")
const app = express()
//Public
app.use(express.static("public"))
const session = require('express-session')
//Passport
const passport = require('passport')
const { initializePassport } = require('./config/passport')
const { login } = require('./controllers/sessions')
//LoggerCustom
const { addLogger, logger } = require('./config/loggerCustom')
//Swagger
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUIExpress = require('swagger-ui-express')
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación API My Comerce by Andrade Matias',
            description: 'Documentación para modulos productos y carrito',
        }
    },
    apis:[`./src/docs/**/*.yaml`]
}
const specs = swaggerJSDoc(swaggerOptions);


app.use(cors())
app.use(addLogger)
app.use(express.json())

//Session
const MongoStore = require('connect-mongo')
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
app.get('/', login)
app.use('/api', require('./routes/loggerTest'))
app.use('/api', require('./routes/products'))
app.use('/api', require('./routes/carts'))
app.use('/api', require('./routes/messages'))
app.use('/api', require('./routes/sessions'))
app.use('/api', require('./routes/mails'))
app.use('/api', require('./routes/users'))
app.use('/apidocs', swaggerUIExpress.serve, swaggerUIExpress.setup(specs))

//Import model message
const Message = require('./services/dao/models/messages')

//Import transformDataProducts
const {transformDataChat } = require('./utils/transformdata')

//Socket Import
const { Server } = require('socket.io')
const io = new Server(server)

//Import db
const MongoManager = require('./services/dao/mongodb/db')
const {verifyMail} = require('./utils/nodemailer')
const classMongoDb = new MongoManager(config.urlMongo);

//View Dependencies
const handlebars = require('express-handlebars')
//Views of renders
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

//Verify connection front with Socket io
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

//Verify connection nodemailer
verifyMail()

//Verify connection host
const PORT = config.port || 3000
server.listen(PORT, () => {
    logger.http(`Server run on port http://localhost:${config.port}`)
    classMongoDb.connectionMongoDb()
})