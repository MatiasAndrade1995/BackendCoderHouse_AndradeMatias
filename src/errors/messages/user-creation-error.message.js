const generateUserErrorInfo = (user) => {
    return `One or more properties have been sent incomplete or are not valid. List of requested properties:
        - first_name: String type, received: ${user.first_name}
        - last_name: String type, received: ${user.last_name}
        - email: String type, received: ${user.email}
        - age: Number type, received: ${user.age}
        - password: String type, received: ${user.password}
    `;
}

const generateProductErrorInfo = (product) => {
    return `One or more properties have been sent incomplete or are not valid. List of requested properties:
        - title: String type, received: ${product.title}
        - description: String type, received: ${product.description}
        - code: Number type, received: ${product.code}
        - price: Number type, received: ${product.price}
        - category: String type, received: ${product.category}
    `;
}

module.exports = { generateUserErrorInfo, generateProductErrorInfo};