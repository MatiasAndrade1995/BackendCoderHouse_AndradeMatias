// DESAFIO ENTREGABLE -"Reestructura de nuestro servidor"
const config = require('./config')
const express = require('express')
const cors = require("cors")
const app = express()
const session = require ('express-session')
const passport = require('passport')
const { initializePassport } = require('./config/passport')
const { login } = require('./controllers/sessions')
const MongoStore = require('connect-mongo')

app.use(cors())
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
app.use('/api', require('./routes/products'))
app.use('/api', require('./routes/carts'))
app.use('/api', require('./routes/messages'))
app.use('/api', require('./routes/sessions'))
app.get('/', login)

// app.use('/images', require('./routes/multer'))

//Import models
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
const classMongoDb = new MongoManager(config.urlMongo);

//Views
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

//Connection
io.on('connection', (socket) => {
    console.log('New user connected in App')
    socket.emit('Welcome', 'Hello, welcome new user')
    socket.on('SendMessage', async (data) => {
        try {
            const prueba = await Message.create(data)
            let messages = await Message.find()
            const dataMessages = transformDataChat(messages)
            socket.emit('refreshmessages', dataMessages)
        } catch (err) {
            console.log(err)
        }
    })
})

const PORT = config.port || 3000
server.listen(PORT, () => {
    console.log(`Server run on port http://localhost:${config.port}`)
    config.nodeEnv === 'test' ? console.log('Test mode on...') : console.log('Production mode on...')
    classMongoDb.connectionMongoDb()
})