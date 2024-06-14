const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_SECRET,
    }
});

module.exports = mail = (to, subject, html) => {
    transporter.sendMail({
        to: to,
        subject: subject,
        html: html,
    }).catch(err => console.log(err));
};