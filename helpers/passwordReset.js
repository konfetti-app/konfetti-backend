// passwordReset helper

const mailgun = require('mailgun.js');
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'});

function sendPasswordEmail (email, magicKey) {
    console.log(`sending password reset link to ${email}`);
    mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: process.env.MAILGUN_FROM,
        to: [email],
        subject: "Password reset requested",
        text: "Testing some Mailgun awesomness!",
        html: `<h1>Hi there!</h1>
        <p>Someone, most likely you, requested a password reset for Konfetti-app.</p>
        <p>To reset your password, please visit this link to set a new password:
        <a href="${process.env.BASEURL}/passwordReset/${magicKey}">${process.env.BASEURL}/passwordReset/${magicKey}</a></p>
        <p>If it was not you who made the request, you can safely ignore this email</p><br/>
        <p>Cheers!<br/>Your Konfetti Team</p>`
      })
      .then(msg => console.log(msg)) // logs response data
      .catch(err => console.log('failed while talking to mailgun: ' + JSON.stringify(err))); // logs any error
}

exports.sendPasswordEmail = sendPasswordEmail;