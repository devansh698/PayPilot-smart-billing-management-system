const nodemailer = require("nodemailer");
const { getOtpEmailTemplate } = require("./emailTemplates");

exports.sendOtpMail = async (email, otp) => {
    try {
        const Auth = { user: process.env.USER1, pass: process.env.PASS1 };
        const mail = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: Auth,
            timeout: 500000,
        });

        const htmlContent = getOtpEmailTemplate(otp);

        await mail.sendMail({
            from: `PayPilot <${process.env.USER1}>`,
            to: email,
            subject: "PayPilot - OTP Verification",
            html: htmlContent,
        });

        console.log(`OTP mail sent to ${email}`);
        return true;
    } catch (err) {
        console.error("Error sending OTP mail:", err);
        throw err;
    }
};