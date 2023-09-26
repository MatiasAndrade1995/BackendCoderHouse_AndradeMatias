const UserDTO = require('../dao/dto/users.dto');
const User = require('../dao/models/users')
const EErros = require('../errors/messages/errors-enum');
const { generateUserErrorInfo } = require('../errors/messages/user-creation-error.message');
const CustomError = require('../errors/customErrors');
const { recoveryPass } = require('../utils/nodemailer');
const { verifyToken } = require('../config/jwt');
const { hashPassword, compare } = require('../utils/handlePassword');

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
    if (req.user && (req.user.rol.includes('admin') || req.user.rol.includes('premium'))) {
        next();
    } else {
        res.status(403).send('Access denied');
    }
};

const isUserMiddleware = (req, res, next) => {
    if (req.user.rol.includes('user') || req.user.rol.includes('premium')) {
        next();
    } else {
        res.status(403).send('Access denied, you have not rol user or premium');
    }
};

const changeRol = async (req, res) => {
    const uid = req.params.uid
    try {
        const user = await User.findById(uid); 
        if (!user) {
            return res.status(404).send('User not found'); 
        }
        if (user.rol.includes('user')) {
            user.rol = 'premium';
        } else {
            user.rol = 'user';
        }
        const updatedUser = await user.save();
        res.status(201).send(`Rol has been changed to ${updatedUser.rol}`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
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

const pageForgotPassword = async (req, res) => {
    res.render('forgotpass')
}

const pageRecoveryPassword = async (req, res) => {
    const token = req.query.token;
    console.log(req.query)
    res.render('recoverypass', {
        token: token
    });
};


const mailRecoverPass = async (req, res) => {
    const body = req.body;
    try {
        const user = await User.findOne({ email: body.email });
        if (!user) {
            return res.status(404).send('No existe usuario con ese correo electrónico');
        }
        recoveryPass(body.email, res);
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
}


const resetPassword = async (req, res) => {
    const newPassword = req.body.password;
    const token = req.query.token;;
    try {
        const decodedEmail = verifyToken(token);
        const user = await User.findOne({ email: decodedEmail.email });

        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }
        const comparePassword = await compare(newPassword, user.password);

        if (comparePassword) {
            return res.status(404).send('No se puede poner misma contraseña')
        }
        const hashPW = await hashPassword(newPassword);
        user.password = hashPW;
        await user.save();
        res.status(200).send('La contraseña ha sido modificada');
    } catch (error) {
        console.error(error);
        if (error.message === 'Token invalid or expired') {
            return res.redirect('/api/forgotPassword');
        }
        res.status(500).send('Error interno del servidor');
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
    validateFieldsRegister,
    pageRecoveryPassword,
    resetPassword,
    mailRecoverPass,
    pageForgotPassword,
    changeRol
}