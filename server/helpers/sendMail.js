const nodemailer = require("nodemailer");

exports.sendMail = async (to, subject, text) => {
  console.log("sendMail called");
  console.log("to is", to);
  console.log("subject is", subject);
  console.log("text is", text);
  const Auth = { user: process.env.USER1, pass: process.env.PASS1 };
  const mail = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: Auth,
    timeout: 500000,
  });

  try {
    const recipients = to.toString();
    console.log("recipients are", recipients);
    console.log("sending mail");
    await mail.sendMail({
      from: process.env.USER1,
      to: recipients,
      subject: subject,
      html: text,
    });

    console.log(`Mail sent to ${recipients}`);
    return true; // Indicate success
  } catch (err) {
    console.error("Error sending email:", err);
    throw err; // Rethrow the error for further handling
  }
};