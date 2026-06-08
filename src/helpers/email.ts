import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer"

export const emailRegister = async (datos: any) => {
    const { email, name, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST as string,

        port: Number(process.env.MAILTRAP_PORT),

        auth: {
            user: process.env.MAILTRAP_USER as string,

            pass: process.env.MAILTRAP_PASS as string,
        },
    });


    //Informacion del email
    const info = await transport.sendMail({
        from: 'Daniel-LA Blog',
        to: email,
        subject: "Blog Daniel-LA, Check your account",
        text: "Check your account at Daniel-LA Blog",
        html: `
            <div style="background-color:#121212; color:white; padding:20px; font-family:Arial, sans-serif;">
            <h2 style="color:#ffffff; text-align:center;">Hi ${name},</h2>
            <p style="font-size:16px; line-height:1.5;">
                Check your account at <b>Daniel-LA Blog</b>.
            </p>
            <p style="font-size:16px; line-height:1.5;">
                Your account is almost ready, just check with the following link:
            </p>
            <p style="text-align:center; margin:20px 0;">
                <a href="http://localhost:5173/user-confirmed/${token}" 
                style="background-color:white; color:#121212; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:bold;">
                Check your account
                </a>
            </p>
            <p style="font-size:14px; color:#bbbbbb;">
                If you have not created this account, please ignore this message.
            </p>
            </div>
        `
    });

}

export const emailNewPassword = async (datos: any) => {
    const { email, name, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST as string,

        port: Number(process.env.MAILTRAP_PORT),

        auth: {
            user: process.env.MAILTRAP_USER as string,

            pass: process.env.MAILTRAP_PASS as string,
        },
    });


    //Informacion del email
    const info = await transport.sendMail({
        from: 'Daniel-LA Blog',
        to: email,
        subject: "Daniel-LA Blog - Reset your Password",
        text: "Reset your Password in Daniel-LA Blog",
        html: `
            <p>Hola: ${name}, Reset your Password in Daniel-LA Blog</p>
            <p>Follow the link below to generate a new password</p>
            <a href="http://127.0.0.1:5173/forget-password/${token}">Reset your Password</a>
            <p>If you have not created this account, please ignore this message</p>
        `
    })
}

export const emailPaymentSuccess = async (data: any) => {
    const { email, name, plan, amount, currency, interval, expiresAt } = data

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST as string,

        port: Number(process.env.MAILTRAP_PORT),

        auth: {
            user: process.env.MAILTRAP_USER as string,

            pass: process.env.MAILTRAP_PASS as string,
        },
    });


    await transport.sendMail({
        from:    'Daniel-LA Blog',
        to:      email,
        subject: 'Payment confirmed — your plan is active',
        text:    `Your payment was successful. Plan: ${plan}`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h2 style="color: #16a34a;">Payment confirmed</h2>
                <p>Hi <strong>${name}</strong>, your payment was processed successfully.</p>

                <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px;"><strong>Plan:</strong> ${plan}</p>
                    <p style="margin: 0 0 8px;"><strong>Amount:</strong> ${amount} ${currency}</p>
                    <p style="margin: 0 0 8px;"><strong>Billing:</strong> ${interval === 'YEAR' ? 'Yearly' : 'Monthly'}</p>
                    <p style="margin: 0;"><strong>Next renewal:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>
                </div>

                <p style="color: #6b7280; font-size: 13px;">
                    Your current rate is locked in. If pricing changes in the future, 
                    it will only apply when you start a new subscription.
                </p>

                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="display: inline-block; margin-top: 16px; background: #2563eb; color: white; 
                          padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                    Go to dashboard
                </a>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
                    If you did not make this payment, please contact us immediately.
                </p>
            </div>
        `
    })
}

export const emailPaymentFailed = async (data: any) => {
    const { email, name, plan, amount, currency } = data

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST as string,

        port: Number(process.env.MAILTRAP_PORT),

        auth: {
            user: process.env.MAILTRAP_USER as string,

            pass: process.env.MAILTRAP_PASS as string,
        },
    });


    await transport.sendMail({
        from:    'Daniel-LA Blog',
        to:      email,
        subject: 'Payment failed — action required',
        text:    `Your payment for the ${plan} plan could not be processed.`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h2 style="color: #dc2626;">Payment failed</h2>
                <p>Hi <strong>${name}</strong>, we were unable to process your payment.</p>

                <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px;"><strong>Plan:</strong> ${plan}</p>
                    <p style="margin: 0;"><strong>Amount:</strong> ${amount} ${currency}</p>
                </div>

                <p style="color: #374151;">This may have happened because:</p>
                <ul style="color: #6b7280; font-size: 14px;">
                    <li>Insufficient funds</li>
                    <li>Card expired or blocked</li>
                    <li>Bank declined the transaction</li>
                </ul>

                <a href="${process.env.FRONTEND_URL}/plans" 
                   style="display: inline-block; margin-top: 16px; background: #2563eb; color: white; 
                          padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                    Try again
                </a>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
                    If you need help, please contact our support team.
                </p>
            </div>
        `
    })
}