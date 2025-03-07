const nodemailer = require("nodemailer")
const { generate } = require("./generate")
require('dotenv').config()

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.E,
    pass: process.env.EP,
  },
})

module.exports = {
  sendConfirmationEmail: async ({ req, res }) => {

    var db = req.datastore.firebaseDB
    var data = req.body.data
    var collection = "_confirmEmail_"
    var ref = db.collection(collection)
    var code = generate(6).toUpperCase()

    transport.sendMail({
      from: data.user,
      to: data.email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${data["firstName"]}</h2>
          <p>Thank you for subscribing. Please confirm your email using this <h1>${code}</h1>.</p>
          </div>`,
    }).catch(err => console.log(err))

    await ref.doc(data.id).set({ email: data.email, username: data.username, code }).then(() => {

      success = true
      message = `Document saved successfuly!`

    }).catch(error => {

      success = false
      message = error
    })

    data.emailConfirmed = false
    await db.collection("user").doc(data.id).set(data).then(() => {

      success = true
      message = `Document saved successfuly!`

    }).catch(error => {

      success = false
      message = error
    })

    return res.send({ success: true, message: "Email Confirmation sent!" })
  }
}