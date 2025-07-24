import nodemailer from "nodemailer";
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"Salon-App" <salon@gmail.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
