const chai = require('chai')
const { hashPassword } = require('../../src/utils/handlePassword')
const { describe } = require('node:test')
const expect = chai.expect

describe('Test about library Bcrypt', () => {

    //Test 01
    it('The function hashPassword has to one password encripted', async function () {

        //Give
        const passwordTest = '123456abc'

        //Then
        const result = await hashPassword(passwordTest);
        console.log(`Result obtained with hashPassword ${result}`)

        //Assert
        expect(result).to.be.not.equal(passwordTest)
        expect(result).to.be.not.ok
        expect(result).to.be.not.undefined
        expect(result).to.be.not.empty

    })
})