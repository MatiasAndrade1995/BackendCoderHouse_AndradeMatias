const nodemailer = require('nodemailer')
const config = require('../config')
const myDirname = require('./dirname')


//USAR "to" en body para pasar mail al cual quiere llegar mensaje de prueba...


const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.mail,
        pass: config.passMail
    }

})

const verifyMail = () => {
    transporter.verify(function (error, succes) {
        if (error) {
            console.log(error)
        } else {
            console.log('Ok to messages')
        }
    })
}

const sendEmail = (req, res) => {
    try {
        const { to } = req.body;
        if (!to) {
            return res.status(400).send({ message: 'Missing recipient email address' });
        }

        const mailOptions = {
            front: 'Test for Mail - Matias Andrade',
            to,
            subject: 'Mail demo',
            html: '<div><h1>Hi, I am Matias Andrade sending mail with Nodemailer!!!</div>'
        };

        const result = transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).send({ message: 'Error', payload: error });
            }
            console.log('Message sent: %s', info.messageId);
            res.send({ message: 'Success', payload: info });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error, message: 'Error trying to send mail from ' + config.mail });
    }
};

const sendEmailWithImages = (req, res) => {
    try {
        const { to } = req.body;
        if (!to) {
            return res.status(400).send({ message: 'Missing recipient email address' });
        }

        const mailOptionsWithImages = {
            front: 'Test for Mail - Matias Andrade',
            to,
            subject: 'Mail demo with images',
            html: `
                <div>
                    <h1>Hi, I am Matias Andrade sending mail with Nodemailer!<h1>
                    <img src="cid:image" />
                </div>`,
            attachments: [
                {
                    fileName: 'Imagen',
                    path: myDirname + '/storage/products/banana.jpg',
                    cid: 'image'
                }
            ]
        };

        const result = transporter.sendMail(mailOptionsWithImages, (error, info) => {
            if (error) {
                console.log(error);
                res.status(400).send({ message: 'Error', payload: error });
            }
            console.log('Message sent: %s', info.messageId);
            res.send({ message: 'Success', payload: info });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error, message: 'Error trying to send mail from ' + config.mail });
    }
};


module.exports = { verifyMail, sendEmail, sendEmailWithImages }