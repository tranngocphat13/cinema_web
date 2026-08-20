import nodemailer from "nodemailer";
import QRCode from "qrcode";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";
import Cinema from "@/models/cinema";
import Room from "@/models/room";
import Seat from "@/models/seat";

export async function sendTicketEmail(bookingId) {
  try {
    if (!bookingId) return { success: false, error: "Missing bookingId" };

    await connectDB();
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "showtime",
        populate: [
          { path: "movie" },
          { path: "cinema" },
          { path: "room" },
        ],
      })
      .populate("seats")
      .lean();

    if (!booking || !booking.customer?.email) {
      console.log("[sendTicketEmail] Booking or customer email not found:", bookingId);
      return { success: false, error: "Booking or customer email not found" };
    }

    // Tạo mã QR base64 của bookingId
    const qrDataUrl = await QRCode.toDataURL(String(booking._id), {
      width: 250,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const ticketCode = booking.ticketCode || `MPX-${String(booking._id).slice(-6).toUpperCase()}`;
    const movieTitle = booking.showtime?.movie?.title || "Phim Chiếu Rạp";
    const cinemaName = booking.showtime?.cinema?.name || "Multiplex Cinema";
    const roomName = booking.showtime?.room?.name || "Phòng Chiếu";
    const startTimeStr = booking.showtime?.startTime
      ? new Date(booking.showtime.startTime).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

    const seatsList = (booking.seats || []).map((s) => s.number).join(", ") || "—";
    const totalMoney = `${(booking.total || 0).toLocaleString("vi-VN")} đ`;

    // Cấu hình transporter nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Vé Xem Phim Multiplex</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #333333; margin: 0; padding: 20px; }
        .ticket-box { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; }
        .header { background: #ff2424; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
        .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
        .body { padding: 28px; }
        .movie-title { font-size: 20px; font-weight: 800; color: #111111; margin: 0 0 16px 0; border-bottom: 2px solid #ff2424; padding-bottom: 8px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
        .info-table .label { color: #777777; width: 35%; }
        .info-table .value { color: #111111; font-weight: 600; text-align: right; }
        .info-table .highlight { color: #ff2424; font-weight: 800; font-size: 16px; }
        .qr-section { text-align: center; padding: 20px; background: #fafafa; border-radius: 12px; border: 1px dashed #cccccc; margin-top: 10px; }
        .qr-section img { width: 180px; height: 180px; border-radius: 8px; }
        .ticket-code { font-family: monospace; font-size: 15px; font-weight: bold; letter-spacing: 2px; color: #333333; margin-top: 8px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888888; background: #f9f9f9; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div class="ticket-box">
        <div class="header">
          <h1>MULTIPLEX CINEMA</h1>
          <p>Xác Nhận Đặt Vé & Hóa Đơn Điện Tử</p>
        </div>
        <div class="body">
          <h2 class="movie-title">${movieTitle}</h2>
          <table class="info-table">
            <tr>
              <td class="label">Mã vé:</td>
              <td class="value">${ticketCode}</td>
            </tr>
            <tr>
              <td class="label">Rạp chiếu:</td>
              <td class="value">${cinemaName}</td>
            </tr>
            <tr>
              <td class="label">Phòng chiếu:</td>
              <td class="value">${roomName}</td>
            </tr>
            <tr>
              <td class="label">Suất chiếu:</td>
              <td class="value">${startTimeStr}</td>
            </tr>
            <tr>
              <td class="label">Ghế ngồi:</td>
              <td class="value highlight">${seatsList}</td>
            </tr>
            <tr>
              <td class="label">Khách hàng:</td>
              <td class="value">${booking.customer?.name || "Quý khách"}</td>
            </tr>
            <tr>
              <td class="label">Tổng thanh toán:</td>
              <td class="value highlight">${totalMoney}</td>
            </tr>
            <tr>
              <td class="label">Thanh toán qua:</td>
              <td class="value">VNPay (Đã thanh toán)</td>
            </tr>
          </table>

          <div class="qr-section">
            <p style="margin:0 0 10px 0; font-size:13px; color:#555; font-weight:600;">MÃ QR SOÁT VÉ VÀO PHÒNG</p>
            <img src="${qrDataUrl}" alt="Mã QR vé" />
            <div class="ticket-code">${ticketCode}</div>
            <p style="margin:8px 0 0 0; font-size:11px; color:#888888;">Vui lòng xuất trình mã QR này tại quầy soát vé rạp chiếu.</p>
          </div>
        </div>
        <div class="footer">
          <p style="margin:0 0 4px 0;">Cảm ơn bạn đã lựa chọn Multiplex Cinema!</p>
          <p style="margin:0;">Chúc bạn có những giây phút xem phim tuyệt vời.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Multiplex Cinema" <${process.env.EMAIL_USER}>`,
      to: booking.customer.email,
      subject: `[Multiplex] Vé Xem Phim & Mã Soát Vé: ${movieTitle} (${ticketCode})`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [sendTicketEmail] Email sent successfully to ${booking.customer.email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ [sendTicketEmail] Error sending ticket email:", error);
    return { success: false, error: error?.message || error };
  }
}
