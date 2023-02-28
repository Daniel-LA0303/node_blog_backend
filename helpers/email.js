import nodemailer from "nodemailer"

export const emailRegister = async (datos) => {
    const {email, name, token} = datos;

    const  transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
    });


    //Informacion del email
    const info = await transport.sendMail({
        from: 'Daniel-LA Blog',
        to: email,
        subject: "Blog Daniel-LA, Check your account",
        text: "Check your account at Daniel-LA Blog",
        html:`
            <p>Hi: ${name}, check your account at Daniel-LA Blog</p>
            <p>TYour account is almost ready, just check with the following link</p>
            <a href="http://127.0.0.1:5173/user-confirmed/${token}">Check your account</a>
            <p>If you have not created this account, please ignore this message</p>
        `
    })
}

export const emailNewPassword = async (datos) => {
    const {email, name, token} = datos;

    const  transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "7b4f208f0fb186",
          pass: "fe80d949309f15"
        }
    });


    //Informacion del email
    const info = await transport.sendMail({
        from: 'Daniel-LA Blog',
        to: email,
        subject: "Daniel-LA Blog - Reset your Password",
        text: "Reset your Password in Daniel-LA Blog",
        html:`
            <p>Hola: ${name}, Reset your Password in Daniel-LA Blog</p>
            <p>Follow the link below to generate a new password</p>
            <a href="http://127.0.0.1:5173/forget-password/${token}">Reset your Password</a>
            <p>If you have not created this account, please ignore this message</p>
        `
    })
}