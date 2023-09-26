const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (email) => {
    try {
        return jwt.sign(
            { email: email },
            config.jwt, 
            { expiresIn: '1h' }
        );
    } catch (error) {
        console.error(error);
    }
}

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.jwt);
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        return decoded;
    } catch (error) {
        console.error('Error al verificar el token:', error);
        throw new Error('Token invalid or expired');
    }
}

module.exports = {
    generateToken,
    verifyToken
}