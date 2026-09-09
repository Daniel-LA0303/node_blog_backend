import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer"

export interface IEmailStatusData {
    email: string;
    name: string;
    postTitle: string;
    postId: string;
    status: 'BANNED' | 'DELETED_BY_ADMIN' | 'HIDDEN_BY_ADMIN' | 'PUBLISHED' | string;
    reason?: string;
}

export interface IEmailUserStatusData {
    email: string;
    name: string;
    status: 'BANNED' | 'ACTIVE' | 'VERIFIED' | string;
    reason?: string;
}

export const emailPostStatusChange = async (datos: IEmailStatusData) => {
    const { email, name, postTitle, postId, status, reason } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST as string,
        port: Number(process.env.MAILTRAP_PORT),
        auth: {
            user: process.env.MAILTRAP_USER as string,
            pass: process.env.MAILTRAP_PASS as string,
        },
    });

    // 1. Content Factory for Post Status Actions
    const statusConfig: Record<string, { subject: string; message: string; buttonText?: string; link?: string }> = {
        BANNED: {
            subject: 'Daniel-LA Blog - Your Post Has Been Banned',
            message: `
        <p style="font-size:16px; line-height:1.5;">
          Your post <b>"${postTitle}"</b> has been <b>banned</b> by our moderation team for violating community guidelines.
        </p>
      `,
        },
        DELETED_BY_ADMIN: {
            subject: 'Daniel-LA Blog - Your Post Was Removed',
            message: `
        <p style="font-size:16px; line-height:1.5;">
          Your post <b>"${postTitle}"</b> was permanently removed by an administrator. This action cannot be undone.
        </p>
      `,
        },
        HIDDEN_BY_ADMIN: {
            subject: 'Daniel-LA Blog - Your Post Is Now Hidden',
            message: `
        <p style="font-size:16px; line-height:1.5;">
          Your post <b>"${postTitle}"</b> has been set to <b>Hidden</b> by an administrator and is no longer visible to the public.
        </p>
      `,
            buttonText: 'View My Posts',
            link: `${process.env.FRONTEND_URL}/profile/posts`,
        },
        PUBLISHED: {
            subject: 'Daniel-LA Blog - Your Post Has Been Restored',
            message: `
        <p style="font-size:16px; line-height:1.5;">
          Great news! Your post <b>"${postTitle}"</b> has been reviewed and restored to public view.
        </p>
      `,
            buttonText: 'View Your Post',
            link: `${process.env.FRONTEND_URL}/post/${postId}`,
        },
    };

    const currentConfig = statusConfig[status] || {
        subject: 'Daniel-LA Blog - Post Status Update',
        message: `
      <p style="font-size:16px; line-height:1.5;">
        The status of your post <b>"${postTitle}"</b> has been updated to: <b>${status}</b>.
      </p>
    `,
    };

    // 2. HTML Template using your dark theme style
    const htmlContent = `
    <div style="background-color:#121212; color:white; padding:20px; font-family:Arial, sans-serif;">
        <h2 style="color:#ffffff; text-align:center;">Hi ${name},</h2>
        ${currentConfig.message}
        
        ${reason ? `
          <p style="font-size:14px; color:#e11d48; margin-top:15px;">
            <b>Reason:</b> ${reason}
          </p>
        ` : ''}

        ${currentConfig.buttonText && currentConfig.link ? `
          <p style="text-align:center; margin:25px 0;">
              <a href="${currentConfig.link}" 
                 style="background-color:#ffffff; color:#121212; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
                  ${currentConfig.buttonText}
              </a>
          </p>
        ` : ''}

        <p style="font-size:14px; color:#bbbbbb;">
            If you believe this was done in error, please contact support or an administrator immediately.
        </p>
    </div>
  `;

    // 3. Send Email
    await transport.sendMail({
        from: 'Daniel-LA Blog <no-reply@daniella-blog.com>',
        to: email,
        subject: currentConfig.subject,
        text: `Hi ${name}, ${currentConfig.subject}. ${reason ? `Reason: ${reason}` : ''}`,
        html: htmlContent,
    });
};

// email new user
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


    // INFO EMAIL
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
                <a href="${process.env.FRONTEND_URL}/user-confirmed/${token}" 
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

// email config forget pass
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

    const info = await transport.sendMail({
        from: 'Daniel-LA Blog',
        to: email,
        subject: "Daniel-LA Blog - Reset your Password",
        text: "Reset your Password in Daniel-LA Blog",
        html: `
            <div style="background-color:#121212; color:white; padding:20px; font-family:Arial, sans-serif;">
                <h2 style="color:#ffffff; text-align:center;">Hi ${name},</h2>
                <p style="font-size:16px; line-height:1.5;">
                    We received a request to reset your password at <b>Daniel-LA Blog</b>.
                </p>
                <p style="font-size:16px; line-height:1.5;">
                    Click the button below to set a new password:
                </p>
                <p style="text-align:center; margin:20px 0;">
                    <a href="${process.env.FRONTEND_URL}/forget-password/${token}"
                    style="background-color:white; color:#121212; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:bold;">
                    Reset your Password
                    </a>
                </p>
                <p style="font-size:14px; color:#bbbbbb;">
                    This link will expire soon for your security. If you did not request a password reset, please ignore this message — your password will remain unchanged.
                </p>
            </div>
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
        from: 'Daniel-LA Blog',
        to: email,
        subject: 'Payment confirmed — your plan is active',
        text: `Your payment was successful. Plan: ${plan}`,
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
        from: 'Daniel-LA Blog',
        to: email,
        subject: 'Payment failed — action required',
        text: `Your payment for the ${plan} plan could not be processed.`,
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

export const emailAddModerator = async (datos: { email: string; name: string; token?: string }) => {
    const { email, name, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST as string,
        port: Number(process.env.MAILTRAP_PORT),
        auth: {
            user: process.env.MAILTRAP_USER as string,
            pass: process.env.MAILTRAP_PASS as string,
        },
    });


    // INFO EMAIL
    const info = await transport.sendMail({
        from: 'Daniel-LA Blog <no-reply@daniella-blog.com>',
        to: email,
        subject: "Daniel-LA Blog - You've been assigned as a Moderator",
        text: `Hi ${name}, an administrator has added you as a moderator. All active sessions have been closed for security reasons. Please re-login to access your new permissions: ${process.env.FRONTEND_URL}/login`,
        html: `
            <div style="background-color:#121212; color:white; padding:20px; font-family:Arial, sans-serif;">
                <h2 style="color:#ffffff; text-align:center;">Hi ${name},</h2>
                <p style="font-size:16px; line-height:1.5;">
                    An administrator has promoted your account to <b>Moderator</b> on <b>Daniel-LA Blog</b>.
                </p>
                <p style="font-size:16px; line-height:1.5;">
                    For security reasons, all of your active sessions have been closed. Please log back in to activate your new permissions:
                </p>
                <p style="text-align:center; margin:25px 0;">
                    <a href="${process.env.FRONTEND_URL}/login" 
                       style="background-color:#ffffff; color:#121212; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
                        Re-login to Your Account
                    </a>
                </p>
                <p style="font-size:14px; color:#bbbbbb;">
                    If you believe this was done in error, please contact support or an administrator immediately.
                </p>
            </div>
        `
    });

    return info;
};

export const emailUserStatusChange = async (datos: IEmailUserStatusData) => {
    const { email, name, status, reason } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST as string,
        port: Number(process.env.MAILTRAP_PORT),
        auth: {
            user: process.env.MAILTRAP_USER as string,
            pass: process.env.MAILTRAP_PASS as string,
        },
    });

    // 1. Content Factory for User Actions
    let subject = 'Daniel-LA Blog - Account Status Update';
    let messageHtml = '';
    let buttonHtml = '';

    if (status === 'BANNED') {
        subject = 'Daniel-LA Blog - Your Account Has Been Banned';
        messageHtml = `
      <p style="font-size:16px; line-height:1.5;">
        Your account has been <b>suspended/banned</b> by an administrator due to a violation of our community guidelines.
      </p>
      <p style="font-size:16px; line-height:1.5;">
        For security reasons, all active sessions have been terminated and you will no longer be able to log in.
      </p>
    `;
    } else if (status === 'ACTIVE') {
        subject = 'Daniel-LA Blog - Your Account Has Been Restored';
        messageHtml = `
      <p style="font-size:16px; line-height:1.5;">
        Great news! An administrator has restored your account access on <b>Daniel-LA Blog</b>.
      </p>
      <p style="font-size:16px; line-height:1.5;">
        You can now log back in and continue using your account normally.
      </p>
    `;
        buttonHtml = `
      <p style="text-align:center; margin:25px 0;">
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background-color:#ffffff; color:#121212; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
            Log In to Your Account
        </a>
      </p>
    `;
    } else if (status === 'VERIFIED') {
        subject = 'Daniel-LA Blog - Your Email Has Been Verified';
        messageHtml = `
      <p style="font-size:16px; line-height:1.5;">
        Your email address has been <b>successfully verified</b>.
      </p>
      <p style="font-size:16px; line-height:1.5;">
        Your account is now fully active. You can log in and start publishing and interacting with the community.
      </p>
    `;
        buttonHtml = `
      <p style="text-align:center; margin:25px 0;">
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background-color:#ffffff; color:#121212; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
            Log In to Your Account
        </a>
      </p>
    `;
    }

    // 2. Build HTML Template
    const htmlContent = `
    <div style="background-color:#121212; color:white; padding:20px; font-family:Arial, sans-serif;">
        <h2 style="color:#ffffff; text-align:center;">Hi ${name},</h2>
        ${messageHtml}
        ${reason ? `<p style="font-size:14px; color:#e11d48; margin-top:15px;"><b>Reason:</b> ${reason}</p>` : ''}
        ${buttonHtml}
        <p style="font-size:14px; color:#bbbbbb;">
            If you believe this was done in error, please contact support or an administrator immediately.
        </p>
    </div>
  `;

    // 3. Send Email
    await transport.sendMail({
        from: 'Daniel-LA Blog <no-reply@daniella-blog.com>',
        to: email,
        subject,
        text: `Hi ${name}, ${subject}. ${reason ? `Reason: ${reason}` : ''}`,
        html: htmlContent,
    });
};