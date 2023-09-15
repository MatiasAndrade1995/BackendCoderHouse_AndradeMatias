const mongoose = require('mongoose');
const { logger } = require('../../config/loggerCustom');

class MongoManager {

    constructor(url) {
        this.url = url 
    }

    connectionMongoDb()  {
            return mongoose.connect(this.url,{ useUnifiedTopology: true, useNewUrlParser: true })
                .then(connect => {
                    logger.info('Conecction succefully')
                })
                .catch(err => logger.error(err)) 
    }
}

module.exports = MongoManager;