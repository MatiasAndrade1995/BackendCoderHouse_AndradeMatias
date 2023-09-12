const UserDTO = require('../dao/dto/users.dto');
const EErros = require('../errors/messages/errors-enum');
const { generateUserErrorInfo } = require('../errors/messages/user-creation-error.message');

const CustomError = require('../errors/customErrors');

const validateFieldsRegister = (req, res, next) => {
    try {
        const { first_name, last_name, email, age, password } = req.body
        const isEmptyOrSpaces = (str) => {
            return str === null || str.match(/^ *$/) !== null;
        };
        
        if (
            isEmptyOrSpaces(first_name) ||
            isEmptyOrSpaces(last_name) ||
            isEmptyOrSpaces(email) ||
            isEmptyOrSpaces(age) ||
            isEmptyOrSpaces(password)
        ) {
            CustomError.createError({
                name: "User creation error",
                cause: generateUserErrorInfo({
                    first_name,
                    last_name,
                    email,
                    age,
                    password
                }),
                message: "Error to create user",
                code: EErros.INVALID_TYPES_ERROR
            });
        }

        next();

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.code, message: error.message });
    }
}


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


module.exports = {
    login,
    formNewUser,
    dataCurrent,
    logout,
    authloginsession,
    errorRegister,
    isAdminMiddleware,
    isUserMiddleware,
    validateFieldsRegister
}