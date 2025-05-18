
const api_key = process.env.MAILGUN_API_KEY
var domain = "sandboxcca13397ed4448ce92329e3202808ff4.mailgun.org";
var mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });


const sendWelcomeEmail = (email, name) => {
    const data = {
        from: "mailgun@sandboxcca13397ed4448ce92329e3202808ff4.mailgun.org",
        to: email,
        subject: "Thank you for singning in",
        // Cadenas interpoladas (``) => sirve para concatenar e insertar directamente las variables en el literal
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
    }
    sendIt(data)
}

const sendCancelationEmail = (email, name) => {
    const data = {
        from: "mailgun@sandboxcca13397ed4448ce92329e3202808ff4.mailgun.org",
        to: email,
        subject: "Sorry to see you go!",
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    }
    sendIt(data)
}

function sendIt(data) {
    console.log(mailgun);
    mailgun.messages().send(data, function (error, body) {
        if (body) { console.log(body) }
        if (error) { console.log(error) }
    });
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}




// var data = {
//     from: "mailgun@sandboxcca13397ed4448ce92329e3202808ff4.mailgun.org",
//     to: "ariascristianmza@gmail.com",
//     subject: "Hello",
//     text: "Testing some Mailgun awesomeness!",
// };
// console.log(mailgun);
// mailgun.messages().send(data, function (error, body) {
//     console.log(body);
//     console.log(error);
// });