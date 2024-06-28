import nodemailer from "nodemailer";
import config from "../app/config";

const sendEmail = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: config.email,
      pass: config.send_email_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Health Care 👻" <${config.email}>`, // sender address 
    to: email, // list of receivers
    subject: "Reset Password Link", // Subject line
    //text: "Hello world?", // plain text body
    html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};

export default sendEmail;
