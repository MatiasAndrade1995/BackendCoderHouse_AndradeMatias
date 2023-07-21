const mongoose = require('mongoose')

class MongoManager {

    constructor(url) {
        this.url = url 
    }

    connectionMongoDb()  {
            return mongoose.connect(this.url,{ useUnifiedTopology: true, useNewUrlParser: true })
                .then(connect => {
                    console.log('Conecction succefully')
                })
                .catch(err => console.log(err)) 
    }
}



module.exports = MongoManager;