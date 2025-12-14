const path = require('path');

// Get the logo URL - adjust this based on your deployment
const getLogoUrl = () => {
    // For development
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3001/logo.png';
    }
    // For production - replace with your actual domain
    return `${process.env.FRONTEND_URL || 'http://localhost:3001'}/logo.png`;
};

exports.getOtpEmailTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PayPilot - OTP Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <img src="${getLogoUrl()}" alt="PayPilot Logo" style="max-width: 150px; height: auto; margin-bottom: 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">PayPilot</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">OTP Verification</h2>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Hello,
                                </p>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                                    You have requested to verify your account. Please use the following One-Time Password (OTP) to complete your verification:
                                </p>
                                <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                                    <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 8px;">${otp}</p>
                                </div>
                                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                                    <strong>Important:</strong> This OTP is valid for 10 minutes only. Do not share this code with anyone.
                                </p>
                                <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0;">
                                    If you didn't request this OTP, please ignore this email or contact support.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="color: #999999; font-size: 12px; margin: 0;">
                                    © ${new Date().getFullYear()} PayPilot. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

exports.getPasswordResetTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PayPilot - Password Reset</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px 8px 0 0;">
                                <img src="${getLogoUrl()}" alt="PayPilot Logo" style="max-width: 150px; height: auto; margin-bottom: 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Reset Your Password</h2>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Hello,
                                </p>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                                    You have requested to reset your password. Please use the following OTP to verify your identity:
                                </p>
                                <div style="background-color: #f8f9fa; border: 2px dashed #f5576c; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                                    <p style="font-size: 32px; font-weight: bold; color: #f5576c; margin: 0; letter-spacing: 8px;">${otp}</p>
                                </div>
                                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                                    <strong>Security Note:</strong> This OTP expires in 10 minutes. If you didn't request this reset, please secure your account immediately.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="color: #999999; font-size: 12px; margin: 0;">
                                    © ${new Date().getFullYear()} PayPilot. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

exports.getOrderConfirmationTemplate = (orderDetails) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PayPilot - Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 8px 8px 0 0;">
                                <img src="${getLogoUrl()}" alt="PayPilot Logo" style="max-width: 150px; height: auto; margin-bottom: 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Thank You for Your Order</h2>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Your order has been successfully placed.
                                </p>
                                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                    <p style="margin: 0; color: #333333;"><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                                    <p style="margin: 10px 0 0; color: #333333;"><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
                                    <p style="margin: 10px 0 0; color: #333333;"><strong>Status:</strong> ${orderDetails.status}</p>
                                </div>
                                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                                    We'll notify you once your order is processed and ready for delivery.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="color: #999999; font-size: 12px; margin: 0;">
                                    © ${new Date().getFullYear()} PayPilot. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

exports.getInvoiceTemplate = (invoiceDetails) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PayPilot - Invoice</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <img src="${getLogoUrl()}" alt="PayPilot Logo" style="max-width: 150px; height: auto; margin-bottom: 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Invoice</h1>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #333333; margin: 0 0 20px; font-size: 24px;">Invoice #${invoiceDetails.invoiceNo}</h2>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                    Your invoice has been generated.
                                </p>
                                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                    <p style="margin: 0; color: #333333;"><strong>Invoice Number:</strong> ${invoiceDetails.invoiceNo}</p>
                                    <p style="margin: 10px 0 0; color: #333333;"><strong>Total Amount:</strong> ₹${invoiceDetails.totalAmount}</p>
                                    <p style="margin: 10px 0 0; color: #333333;"><strong>Payment Status:</strong> ${invoiceDetails.paymentStatus}</p>
                                </div>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="color: #999999; font-size: 12px; margin: 0;">
                                    © ${new Date().getFullYear()} PayPilot. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

