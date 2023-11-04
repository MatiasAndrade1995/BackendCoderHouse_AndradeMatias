const winston = require('winston')
const config = require('../config')

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5 
    },
    colors: {
        fatal: 'magenta',
        error: 'red',
        warning: 'yellow',
        info: 'green',
        http: 'blue',
        debug: 'white' 
    }
}

//Custom logger para desarrollo
const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels, 

    transports: [
        //Console
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelsOptions.colors}),
                winston.format.simple()
                
            )
        }),
        //File
        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: winston.format.simple()
        })
    ]
})

//Custom logger para producción
const productLogger = winston.createLogger({
    levels: customLevelsOptions.levels,

    transports: [
        //Console
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()

            )
        }),
        //File
        new winston.transports.File({
            filename: './errors.log',
            level: 'error',
            format: winston.format.simple()
        })
    ]
})

let logger;

if (config.environment === "production") {
    logger = productLogger
} else {
    logger = devLogger 
}

const addLogger = (req, res, next) => {
    if (config.environment === "production") {
        req.logger = productLogger
    } else {
        req.logger = devLogger
    }

    next()
}

module.exports = {
    addLogger,
    logger
}