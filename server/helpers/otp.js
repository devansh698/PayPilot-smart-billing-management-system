const express = require("express");
const nodemailer = require("nodemailer");
try{
    exports.sendOtpMail = async (email,otp) => {
  const Auth={ user: process.env.USER1, pass: process.env.PASS1 };
    const mail = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: Auth,
      timeout: 500000,
    });
  
    mail.sendMail(
      {
        from: process.env.USER1,
        to: [email],
        subject: "Trying to login",
        html: `otp for login your account ${otp}`,
      },
      (err) => {
        if (err) throw err;
        console.log(`Mail sent to ${email}`);
        return true;
      }
    );
    return true;
  };
}
catch(err){
    console.log(err);
}