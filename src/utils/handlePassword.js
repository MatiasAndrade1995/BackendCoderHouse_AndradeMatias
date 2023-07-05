const bcrypt = require('bcrypt')

const hashPassword = async (password) => {
    const hash = await bcrypt.hash(password, 10)
    return hash
}

const compare = async (password, hashPasswordUnit) => {
    const validate = await bcrypt.compare(password, hashPasswordUnit)
    return validate;
}

module.exports = {
    hashPassword,
    compare
}