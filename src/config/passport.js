const passport = require('passport')
const config = require('../config')
const LocalStrategy = require('passport-local').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const User = require('../dao/models/users')
const { hashPassword, compare } = require('../utils/handlePassword');
const Carts = require("../dao/mongodb/carts.mongo");
const cartService = new Carts()

const initializePassport = () => {
    passport.use(
        'register',
        new LocalStrategy(
            {
                passReqToCallback: true,
                usernameField: 'email',
            },
            async (req, username, password, done) => {
                try {
                    let userData = req.body;
                    let user = await User.findOne({ email: username });
                    if (user) {
                        console.log('User already exists');
                        return done(null, false, { message: 'User already exists' });
                    }
                    const hashPW = await hashPassword(password);
                    let cart = await cartService.createCart({});
                    const data = {
                        ...userData,
                        password: hashPW,
                        cartID: cart._id  
                    };
                    let result = await User.create(data);
                    return done(null, result);
                } catch (err) {
                    console.log(err);
                    return done(err);
                }
            }
        )
    );

    passport.use('login', new LocalStrategy(
        {
            passReqToCallback: true,
            usernameField: 'email',
            passwordField: 'password'
        },

        async (req, username, password, done) => {
            try {
                const user = await User.findOne({ email: username });
                
                const validPassword = await compare(password, user.password);
                if (validPassword) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password error...' });
                }
            } catch (error) {
                return done(error);
            }
        }
    ))

    passport.use(
        'auth-github',
        new GitHubStrategy(
            {
                clientID: config.clientId,
                clientSecret: config.clientSecret,
                callbackURL: 'http://localhost:8080/api/auth/github/callback'
            },
            async function (accessToken, refreshToken, profile, done) {
                let firstAndLastName = profile._json.name.split(' ');
                try {
                    let user = await User.findOne({ email: `${profile._json.login}@github.com.ar` });
                    if (user == null) {
                        const hashPW = await hashPassword(profile._json.node_id)
                        let cart = await cartService.createCart({});
                        let newUser = {
                            first_name: firstAndLastName[0].toString(),
                            last_name: firstAndLastName[1].toString(),
                            email: `${profile._json.login}@github.com.ar`,
                            age: 2023,
                            password: hashPW,
                            cartID: cart._id 
                        };
                        let result = await User.create(newUser);

                        done(null, result);
                    } else {
                        done(null, user);
                    }
                } catch (error) {
                    console.error('Error:', error); 
                    done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        try {
            done(null, user._id);
        } catch (error) {
            done(null, error)
        }
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await User.findById(id);
            done(null, user)
        } catch (error) {
            done(null, error)
        }
    });
};

module.exports = { initializePassport }