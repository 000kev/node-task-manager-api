const sgMail = require('@sendgrid/mail')

//console.log(process.env.SENDGRID_API_KEY)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


// sgMail.send({
//     to: 'kumasambakyg@icloud.com',
//     from:'kumasambakyg@gmail.com',
//     subject: 'Task Email Test',
//     text: 'I hope this gets to you!'
// }).then(() => console.log('Email sent!')).catch(() => console.log('Oops!'))

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kumasambakyg@gmail.com',
        subject: 'Thanks for joining!',
        text: `Welcome to the app, ${name}. Let me know how you find it.`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'kumasambakyg@gmail.com',
        subject: 'Bye!',
        text: `Goodbye, ${name}. Sorry to see you go.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}