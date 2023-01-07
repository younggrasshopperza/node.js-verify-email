require('dotenv').config();
const axios = require('axios').default;
const { transporter, options } = require('../../config/email.config');

module.exports = {
    sendEmail: async (payload) => {
        console.log(payload)
        try {
            const encodedParams = new URLSearchParams()
            encodedParams.set('context', `{ "full_name" : "${payload.fullName}", "image" : "https://firebasestorage.googleapis.com/v0/b/ua-squad-staging.appspot.com/o/users%2FzSgGS8Q0HJhuoZ15KjXY2DiZcNJ3%2Fprofile-picture%2Fd1390da7-6db9-4029-8e2f-8ceb49e696da-download%20(2).jpeg?alt=media&token=e1768ba8-6eee-47b0-af36-a897c2bcf166" }`)
            options.data = encodedParams
            options.url = process.env.GENERAL_EMAIL_TEMPLATE_URL
            // Fetch email template
            const response = await axios.request(options)
            const mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: payload.email,
                subject: "Basic Email template",
                html: response.data.data.html
            }
            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error.message)
                    return error
                } else {
                    return info;
                }
            })
        } catch (error) {
            console.log(error.message);
        }
    }
}