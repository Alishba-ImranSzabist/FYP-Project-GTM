  //Brevo ke file------------------------

  
  import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

transporter
  .sendMail({
    from: process.env.MAIL_FROM,
    to: "tcfalishba@gmail.com",
    subject: "Test email",
    text: "Brevo + Nodemailer is working!",
  })
  .then((info) => console.log("send successfully:", info.messageId))
  .catch((err) => console.error("Error:", err.message));
