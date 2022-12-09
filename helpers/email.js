import nodemailer from "nodemailer"

export const emailRegister = async (datos) => {
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
        from: '"UpTask - Administrador de Proyectos"  <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en UpTask",
        html:`
            <p>Hola: ${name}, comprueba tu cuenta en UpTask</p>
            <p>Tu cuenta ya esta casi lista, solo compruebala con el siguiente enlace</p>
            <a href="http://127.0.0.1:5173/user-confirmed/${token}">Comprueba tu cuenta</a>
            <p>Si no has creado esta cuenta, por favor ignora este mensaje</p>
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
        from: '"UpTask - Administrador de Proyectos"  <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reestablece tu Password",
        text: "Reestablece tu Password en UpTask",
        html:`
            <p>Hola: ${name}, Reestablece tu Password en UpTask</p>
            <p>Sigue el siguiente enlace para generar un nuevo password</p>
            <a href="http://127.0.0.1:5173/forget-password/${token}">Reestablecer Password</a>
            <p>Si no has creado esta cuenta, por favor ignora este mensaje</p>
        `
    })
}