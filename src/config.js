const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.PORT,
    urlMongo: process.env.URL_MONGO,
    nodeEnv: process.env.NODE_ENV,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    secretBd: process.env.SECRET_BD,
    passMail: process.env.NODEMAILER,
    mail: process.env.GMAIL
};