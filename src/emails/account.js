const sgMail = require('@sendgrid/mail')

//const sendgridAPIKey = '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'

sgMail.setApiKey('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')

// sgMail.setApiKey({
//     to: 'aaphomer@gmail.com',
//     from: 'aaphomer@gmail.com',
//     subject: 'This is my first app',
//     text: 'I pray this app works.'
// })


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
            to: email,
            from: 'aaphomer@gmail.com',
            subject: 'This is my first app',
            text: `Welcome to the app, ${name}. Let me know your mind on this app.`
    })
}

const cancelationMail = (email, name) => {
    sgMail.send({
        to: email,
            from: 'aaphomer@gmail.com',
            subject: 'first app DELETED',
            text: `GOODBYE to the app, ${name}. can i know why you canceled your task on this app ?.`
    })
}


module.exports = {
    sendWelcomeEmail: sendWelcomeEmail,
    cancelationMail: cancelationMail
}

