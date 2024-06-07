const emailConfirm = (who, what) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
            }
            .header h1 {
                margin: 0;
                color: #333333;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .content p {
                font-size: 16px;
                color: #666666;
                line-height: 1.5;
                margin: 0 0 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffffff;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                padding: 20px 0;
                font-size: 12px;
                color: #999999;
            }
        </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h1>Email Confirmation</h1>
        </div>
        <div class="content">
            <p>Hi ${who},</p>
            <p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
            <a href=${what} class="button">Confirm Email</a>
            <p>If you did not sign up for this account, you can ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Trento JOB. All rights reserved.</p>
        </div>
    </div>
    </body>
    </html>`
};

const emailWelcome = (who, what) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
            }
            .header h1 {
                margin: 0;
                color: #333333;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .content p {
                font-size: 16px;
                color: #666666;
                line-height: 1.5;
                margin: 0 0 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffffff;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                padding: 20px 0;
                font-size: 12px;
                color: #999999;
            }
        </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Service!</h1>
        </div>
        <div class="content">
            <p>Hi ${who},</p>
            <p>We're excited to have you on board. Thank you for confirming your email address. You can now explore all the features and benefits of our service.</p>
            <p>To get started, click the button below and log in to your account:</p>
            <a href=${what} class="button">Get Started</a>
            <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Trento JOB. All rights reserved.</p>
        </div>
    </div>
    </body>
    </html>`
};

const emailVerification = (who) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                background-color: #f6f8fa;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border: 1px solid #e1e4e8;
                border-radius: 6px;
            }
            .header {
                text-align: center;
                padding: 20px 0;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                color: #24292e;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .content p {
                font-size: 16px;
                color: #24292e;
                line-height: 1.5;
                margin: 0 0 20px;
            }
            .footer {
                text-align: center;
                padding: 20px 0;
                font-size: 12px;
                color: #6a737d;
            }
        </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h1>Email Verified!</h1>
        </div>
        <div class="content">
            <p>Hi ${who},</p>
            <p>Your email address has been successfully verified. Our administrators will review and verify your data within the next 48 hours.</p>
            <p>Our team will send a notification through this email when the account is ready.</p>
            <p>Thank you for your patience.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Trento JOB. All rights reserved.</p>
        </div>
    </div>
    </body>
    </html>`;
};

const emailVerified = (who, what) => {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
            }
            .header h1 {
                margin: 0;
                color: #333333;
            }
            .content {
                text-align: center;
                padding: 20px 0;
            }
            .content p {
                font-size: 16px;
                color: #666666;
                line-height: 1.5;
                margin: 0 0 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #ffffff;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                padding: 20px 0;
                font-size: 12px;
                color: #999999;
            }
        </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Service!</h1>
        </div>
        <div class="content">
            <p>Hi ${who},</p>
            <p>We're excited to have you on board. Your account is ready. You can now explore all the features and benefits of our service.</p>
            <p>To get started, click the button below and log in to your account:</p>
            <a href=${what} class="button">Get Started</a>
            <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
    </div>
    </body>
    </html>`;
};



module.exports = {
    emailConfirm,
    emailWelcome,
    emailVerification,
    emailVerified,
}