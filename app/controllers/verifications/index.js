require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;
const { transporter, options } = require('../../../config/email.config');

module.exports = {
    sendEmailVerification: async (payload) => {
        try {
            const saltRounds = 10;
            const encryptedEmail = await bcrypt.hashSync(payload.email, saltRounds);
            const encryptedUid = await bcrypt.hashSync(payload.uid, saltRounds);
            const token = jwt.sign({encryptedEmail, encryptedUid}, process.env.JWT_ACC_ACTIVATE, {expiresIn: '5m'});
            const encodedParams = new URLSearchParams();
            encodedParams.set('context', `{ "full_name" : "${payload.fullName}", "verify_email":"${process.env.CLIENT_URL}/action?mode=verifyEmail&oobCode=${token}" }`);
            options.data = encodedParams;
            options.url = process.env.GENERAL_EMAIL_TEMPLATE_URL;
            // Fetch email template
            const response = await axios.request(options);
            const mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: payload.email,
                subject: "Basic Email template",
                html: response.data.data.html
            }
            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    throw new Error('Eish! Why email no work ¯\_(ツ)_/¯ 🤷\nBecause: ' + error.message);
                } else {
                    return {
                        message: info,
                        status: 200
                    }
                }
            })
        } catch (error) {
            return {
                message: error.message,
                status: 400
            }
        }
    },
    verifyEmail: (payload) => {
        try {
            if (!payload.authorization) {
                throw new Error('There is no bearer token in the headers 🧐');
            }
            const token = payload.authorization.split(' ')[1];
            if(token) {
                jwt.verify(token, process.env.JWT_ACC_ACTIVATE, (error, decodedToken) => {
                    if(error) {
                        throw new Error('Eish! Link has expired ¯\_(ツ)_/¯');
                    }
                    else {
                        const {encryptedEmail, encryptedUid} = decodedToken;
                        const actualUid = bcrypt.compareSync(payload.uid, encryptedUid);
                        const actualEmail = bcrypt.compareSync(payload.email, encryptedEmail);
                        if(actualUid && actualEmail) {
                            return {
                                message: 'Your email has been verified',
                                status: 200
                            }
                        }
                        else {
                            throw new Error('Hectic, You uid and/or email does not match!! 😳');
                        }
                    }
                })
            } else {
                throw new Error('Eish! Token no work ¯\_(ツ)_/¯');
            }
        } catch (error) {
            return {
                message: error.message,
                status: 400
            }
        }
    },
}