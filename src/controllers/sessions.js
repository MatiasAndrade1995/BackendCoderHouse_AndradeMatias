const session = require('express-session')
const cookiesParser = require('cookie-parser')
const FileStore = require('session-file-store')(session);
const MongoStore = require('connect-mongo')
const User = require('../dao/models/users');
const { hashPassword, compare } = require('../utils/handlePassword');

const sessionMiddleware = session({
    store: MongoStore.create({
        mongoUrl: process.env.URL_MONGO
    }),
    secret: 'secretBackend',
    resave: true,
    saveUninitialized: true
})

async function authlogin(req, res, next) {
    try {
        if (req.session.email === req.body.email && req.session.password) {
            res.send('You are already connected')
        } else {
            next()
        }
    } catch {
        res.status(401).send('Error in authetication')
    }
}

async function authloginsession(req, res, next) {
    try {
        if (req.session.email && req.session.password) {
            next()
        } else {
            res.send('You need connect first')
        }
    } catch {
        res.status(401).send('Error in authetication')
    }
}

const login = async (req, res) => {
    res.render('login')
}

const loginUser = async (req, res) => {
    if (req.body.email == 'adminCoder@coder.com' && req.body.password == 'adminCod3r123') {
        req.session.first_name = 'Admin Backend';
        req.session.last_name = 'Coder House';
        req.session.password = req.body.password;
        req.session.email = req.body.email;
        req.session.age = '28';
        req.session.rol = 'admin';
        res.redirect('/api/products');
        return;
    } else {
        try {
            const user = await User.findOne({ email: req.body.email });
            const validPassword = await compare(req.body.password, user.password)
            if (validPassword) {
                req.session.first_name = user.first_name;
                req.session.last_name = user.last_name;
                req.session.email = user.email;
                req.session.password = user.password;;
                req.session.age = user.age;
                req.session.rol = user.rol;
                res.status(200).redirect('/api/products');
            } else {
                res.status(400).send('Password error...');
            }
        } catch (error) {
            res.status(404).send('Error in authetication');
        }
    }
};

const formNewUser = async (req, res) => {
    res.render('register')
}

const registerNewUser = async (req, res) => {
    let body = req.body
    const hashPW = await hashPassword(body.password)
    const data = { ...body, rol: 'user', password: hashPW }
    try {
        await User.create(data)
        res.render('registersuccefully', {
            name: req.body.first_name
        })
    } catch (error) {
        res.status(404).render('errorregister')
    }
}

const dataProfile = async (req, res) => {
    res.render('profile', {
        firstname: req.session.first_name,
        lastname: req.session.last_name,
        age: req.session.age,
        email: req.session.email,
        rol: req.session.rol
    })
}

const logout = async (req, res) => {
    try {
        await req.session.destroy(err => {
            if (err) {
                res.send('Failed to logout');
            } else {
                res.clearCookie('connect.sid').redirect('/api');
            }
        })
    } catch (err) {
        res.send(err)
    }
}

module.exports = {
    login,
    authlogin,
    loginUser,
    sessionMiddleware,
    formNewUser,
    dataProfile,
    registerNewUser,
    logout,
    authloginsession
}