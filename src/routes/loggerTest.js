const express = require('express')
const router = express.Router()

router.get('/loggerTest', (req, res) => {
    req.logger.debug('Prueba de log level debug');
    req.logger.http('Prueba de log level error');
    req.logger.info('Prueba de log level error');
    req.logger.warning('Prueba de log level error');
    req.logger.error('Prueba de log level error');
    req.logger.fatal('Prueba de log level error');
    res.send("Prueba de logger")
})

module.exports = router
