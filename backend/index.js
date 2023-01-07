const express = require('express');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const notifications = require('./backend/app/controllers/notifications');
const verifications = require('./backend/app/controllers/verifications');

app.post('/send-email', async (req, res) => {
    const result = await notifications.sendEmail(req.body);
    if(result.status === 200)
        return res.status(200).send(result.message);
    if(result.status === 400)
        return res.status(400).send(result.message);
})

app.post('/send-verification', async (req, res) => {
    const result = await verifications.sendEmailVerification(req.body);
    if(result.status === 200)
        return res.status(200).send(result.message);
    if(result.status === 400)
        return res.status(400).send(result.message);
});

app.post("/verify-email", async (req, res) => {
    const { authorization } = req.headers;
    const { uid, email } = req.body;
    const result = await verifications.verifyEmail({ authorization, uid, email });
    if(result.status === 200)
        return res.status(200).send(result.message);
    if(result.status === 400)
        return res.status(400).send(result.message);
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})