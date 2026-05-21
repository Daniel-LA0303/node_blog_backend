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