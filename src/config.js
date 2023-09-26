const dotenv = require('dotenv');
const { Command } = require('commander');


const program = new Command();

program
    .option('--dev', 'Modo desarrollo', 'development')
    .option('--prod', 'Modo producción', 'production')

program.parse();

let environment;

if (program.opts().dev == 'development') {
    environment = 'production'
} else {
    environment = 'development'
}


console.log('Modo option: ' + environment)

dotenv.config({
    path: environment === 'production' ? './.env.production' : './.env.development'
});

module.exports = {
    port: process.env.PORT,
    urlMongo: process.env.URL_MONGO,
    nodeEnv: process.env.NODE_ENV,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    secretBd: process.env.SECRET_BD,
    passMail: process.env.NODEMAILER,
    mail: process.env.GMAIL,
    jwt: process.env.PASSJWT,
    environment: environment
};
