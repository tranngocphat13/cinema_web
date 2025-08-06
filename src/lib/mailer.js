import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Cấu hình transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Dùng Gmail (hoặc đổi sang SMTP khác)
      auth: {
        user: process.env.EMAIL_USER, // Email gửi
        pass: process.env.EMAIL_PASS, // App password (không dùng mật khẩu thật)
      },
    });

    // Gửi email
    const mailOptions = {
      from: `"Movie Booking" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
