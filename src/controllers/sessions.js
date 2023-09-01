// const config = require('../config');
// const User = require('../dao/models/users');
// const { hashPassword, compare } = require('../utils/handlePassword');

const UserDTO = require('../dao/dto/users.dto');
async function authloginsession(req, res, next) {
    try {
        if (req.isAuthenticated()) {
            next()
        } else {
            res.send('You need connect first')
        }
    } catch {
        res.status(401).send('Error in authetication')
    }
}

const login = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            res.redirect('/api/current');
        } else {
            res.render('login')
        }
    } catch {
        res.status(401).send('Error in authetication')
    }
}

const formNewUser = async (req, res) => {
    res.render('register')
}

const errorRegister = (req, res) => {
    res.status(404).render('errorregister')
}

const dataCurrent = async (req, res) => {
    const userDTO = new UserDTO({
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        rol: req.user.rol
    });
    res.render('current', {
        firstname: userDTO.first_name,
        lastname: userDTO.last_name,
        age: userDTO.age,
        email: userDTO.email,
        rol: userDTO.rol
    });
};

const isAdminMiddleware = (req, res, next) => {
    if (req.user && req.user.rol.includes('admin')) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

const isUserMiddleware = (req, res, next) => {
    if (req.user && req.user.rol.includes('user')) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

const logout = async (req, res) => {

    try {
        await req.session.destroy()
        res.clearCookie('connect.sid').redirect('/api');

    } catch (err) {
        res.send(err) || res.send('Failed to logout')

    }

}

// const loginUser = async (req, res) => {

//     const isTestMode = config.nodeEnv === 'test';

//     if (isTestMode) {

//         const testData = {
//             email: 'adminCoder@coder.com',
//             password: 'adminCod3r123',
//             first_name: 'Admin Backend',
//             last_name: 'Coder House',
//             age: '28',
//             rol: 'admin'
//         };

//         if (req.body.email === testData.email && req.body.password === testData.password) {
//             req.session.first_name = testData.first_name;
//             req.session.last_name = testData.last_name;
//             req.session.password = req.body.password;
//             req.session.email = req.body.email;
//             req.session.age = testData.age;
//             req.session.rol = testData.rol;
//             res.redirect('/api/products');
//             return;
//         }
//     } else {

//         try {
//             const user = await User.findOne({ email: req.body.email });
//             const validPassword = await compare(req.body.password, user.password);

//             if (validPassword) {
//                 req.session.first_name = user.first_name;
//                 req.session.last_name = user.last_name;
//                 req.session.email = user.email;
//                 req.session.password = user.password;
//                 req.session.age = user.age;
//                 req.session.rol = user.rol;
//                 res.status(200).redirect('/api/products');
//             } else {
//                 res.status(400).send('Password error...');
//             }
//         } catch (error) {
//             res.status(404).send('Error in authentication');
//         }
//     }
// };

// const registerNewUser = async (req, res) => {
//     let body = req.body
//     const hashPW = await hashPassword(body.password)
//     const data = { ...body, rol: 'user', password: hashPW }
//     try {
//         await User.create(data)
//         res.render('registersuccefully', {
//             name: req.body.first_name
//         })
//     } catch (error) {
//         res.status(404).render('errorregister')
//     }
// }

module.exports = {
    login,
    formNewUser,
    dataCurrent,
    logout,
    authloginsession,
    errorRegister,
    isAdminMiddleware,
    isUserMiddleware
}