const UserDTO = require('../services/dto/users.dto');
const User = require('../services/dao/models/users')
const EErros = require('../errors/messages/errors-enum');
const { generateUserErrorInfo } = require('../errors/messages/user-creation-error.message');
const CustomError = require('../errors/customErrors');
const { recoveryPass, deleteAcountMail } = require('../utils/nodemailer');
const { verifyToken } = require('../config/jwt');
const { hashPassword, compare } = require('../utils/handlePassword');


//Valida campos para el registro de nuevo usuario
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
            res.status(400).res.send('You need connect first')
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

//Data para profile
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
        res.status(403).send({ ok: false, error: `User with email ${req.user.email} is not premium` });
    }
};

const isUserMiddleware = (req, res, next) => {
    if (req.user.rol.includes('user') || req.user.rol.includes('premium')) {
        next();
    } else {
        res.status(403).send('Access denied, you have not rol user or premium');
    }
};

//Controlador para que el usuario pueda cambiar de rol sin cargo los documentos requeridos
const userChangeRoleController = async (req, res) => {
    const uid = req.params.uid;
    try {
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.rol.includes('premium')) {
            // Si el usuario es "premium," cambiarlo a "user" sin necesidad de verificar documentos
            user.rol = 'user';
            const updatedUser = await user.save();
            res.status(201).send(`Rol has been changed to ${updatedUser.rol}`);
        } else if (user.rol.includes('user')) {
            // Verifica si el usuario tiene los tres documentos necesarios
            const hasRequiredDocuments = ['identification', 'proofOfAddress', 'accountStatement'].every(requiredDoc => {
                return user.documents.some(doc => doc.name === requiredDoc);
            });

            if (hasRequiredDocuments) {
                user.rol = 'premium';
                const updatedUser = await user.save();
                res.status(201).send(`Rol has been changed to ${updatedUser.rol}`);
            } else {
                res.status(400).send('User does not have all three required documents');
            }
        } else {
            res.status(400).send('User is neither "user" nor "premium"');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};



//Cierra session actual
const logout = async (req, res) => {
    const email = req.user.email;
    try {
        const user = await User.findOne({ email }); 
        if (!user) {
            throw new Error('Failed to logout');
        }
        user.last_connection = new Date(); 
        await user.save()
        await req.session.destroy();
        res.clearCookie('connect.sid');
        res.redirect('/api');
    } catch (err) {
        res.status(500).send(err.message || 'Failed to logout'); 
    }
}




const pageForgotPassword = async (req, res) => {
    res.render('forgotpass')
}

const pageRecoveryPassword = async (req, res) => {
    const token = req.query.token;
    res.render('recoverypass', {
        token: token
    });
};

//Mail para recuperar password
const mailRecoverPass = async (req, res) => {
    const body = req.body;
    const baseUrl = `http://${req.get('host')}`
    try {
        const user = await User.findOne({ email: body.email });
        if (!user) {
            return res.status(404).send('No existe usuario con ese correo electrónico');
        }
        recoveryPass(body.email, baseUrl, res);
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
}

//Controlador para cambiar password
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

//Se encarga del manejo de las urls de los archivos que se cargan en el db
const documents = async (req, res) => {
    const { uid } = req.params;
    const files = req.files;

    if (!files) return res.status(404).send('No files');

    try {
        const user = await User.findOne({ _id: uid });

        if (!user) return res.status(404).send('User not found');

        const imageProductFileName = req.files['imageProduct'] ? req.files['imageProduct'][0].filename : null;
        const identificationFileName = req.files['identification'] ? req.files['identification'][0].filename : null;
        const proofOfAddressFileName = req.files['proofOfAddress'] ? req.files['proofOfAddress'][0].filename : null;
        const accountStatementFileName = req.files['accountStatement'] ? req.files['accountStatement'][0].filename : null;
        const imageProfileFileName = req.files['imageProfile'] ? req.files['imageProfile'][0].filename : null;


        const baseUrl = `http://${req.get('host')}/storage/`;

        const documentsToPush = [];

        if (imageProductFileName) {
            documentsToPush.push({ name: 'imageProduct', reference: `${baseUrl}/products/${imageProductFileName}` });
        }

        if (identificationFileName) {
            documentsToPush.push({ name: 'identification', reference: `${baseUrl}/documents/${identificationFileName}` });
        }

        if (proofOfAddressFileName) {
            documentsToPush.push({ name: 'proofOfAddress', reference: `${baseUrl}/documents/${proofOfAddressFileName}` });
        }

        if (accountStatementFileName) {
            documentsToPush.push({ name: 'accountStatement', reference: `${baseUrl}/documents/${accountStatementFileName}` });
        }

        if (imageProfileFileName) {
            documentsToPush.push({ name: 'imageProfile', reference: `${baseUrl}/profiles/${imageProfileFileName}` });
        }

        user.documents.push(...documentsToPush);

        await user.save();

        res.status(201).send({ messagge: 'Charge files succesfully', data: documentsToPush });

    } catch (error) {
        res.status(500).send('Error in documents controller');
    }
}

//Captura todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await User.find(); 

        if (!users) {
            return res.status(404).send('No se encontraron usuarios'); 
        }

        const usersData = users.map(user => ({
            first_name: user.first_name,
            last_name: user.last_name,
            age: user.age,
            email: user.email,
            rol: user.rol
        }));

        res.status(200).send(usersData); 

    } catch (error) {
        console.error(error); 
        res.status(500).send('Error en el controlador de getUsers');
    }
}

//Captura si hay users y users premium
const usersHandlebars = async (req, res) => {
    try {
        const users = await User.find({ rol: { $in: ['user', 'premium'] } })    
        const usersData = users.map(user => ({
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            age: user.age,
            email: user.email,
            rol: user.rol
        }));
        res.status(200).render('paneladministrador', {
            users: usersData,
            hasUsers: usersData.length > 0  // true si hay usuarios, false si no hay usuarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el controlador de getUsers');
    }
}

//Elimina usuarios inactivos de mas de 2 dias
const deleteUsers = async (req, res) => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const usersMails = await User.find({ last_connection: { $lt: twoDaysAgo } });
        for (const user of usersMails) {
            await deleteAcountMail(user.email);
        }
        await User.deleteMany({ last_connection: { $lt: twoDaysAgo } });
        res.status(201).send('Usuarios eliminados con éxito');
    } catch (error) {
        res.status(500).send('Error en el controlador deleteUsers');
    }
}

//Controlador para que admin pueda cambiar rol de usuario
const adminChangeRoleController = async (req, res) => {
    const { newRole } = req.body
    const { uid } = req.params
    try {
        const user = await User.findByIdAndUpdate(uid, {
            rol: newRole
        }, { new: true })
        if (!user) return res.status(404).send('No se pudo modificar usuario')
        res.status(302).redirect('/api/users/admin');
    } catch (error) {
        res.status(500).send('Error en el controlador adminChangeRoleController')
    }
}

//Controlador para que admin pueda eliminar usuario
const adminChangeDeleteController = async (req, res) => {
    const { uid } = req.params
    try {
        const user = await User.findByIdAndDelete(uid)
        if (!user) return res.status(404).send('No se pudo eliminar usuario')
        res.status(201).send('Usuario eliminado')
    } catch (error) {
        res.status(500).send('Error en el controlador adminChangeRoleController')
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
    userChangeRoleController,
    documents,
    getUsers,
    deleteUsers,
    adminChangeRoleController,
    adminChangeDeleteController,
    usersHandlebars
}