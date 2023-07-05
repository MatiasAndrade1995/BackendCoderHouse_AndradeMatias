const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/../../public/storage/products`)
    },
    filename: function (req, file, cb) {
        cb(null, `file-${Date.now()}-${file.originalname}`)
    }
});

const uploadMulter = multer({ storage });

module.exports = uploadMulter;
