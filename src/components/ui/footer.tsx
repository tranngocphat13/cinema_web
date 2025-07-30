"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột 1: Logo + Giới thiệu */}
        <div>
          <h2 className="text-2xl font-bold text-green-500">MyCinema</h2>
          <p className="mt-4 text-gray-400">
            Đặt vé xem phim nhanh chóng – tiện lợi – an toàn. MyCinema mang đến
            trải nghiệm điện ảnh tuyệt vời cho bạn.
          </p>
        </div>

        {/* Cột 2: Thông tin liên hệ */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
          <p>📍 335 Nguyễn Hữu Thọ Tân Phong Quận 7 </p>
          <p>📞 0339573513</p>
          <p>✉️ support@mycinema.vn</p>
        </div>

        {/* Cột 3: Google Map */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Bản đồ</h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.036434771447!2d106.69889900795566!3d10.731673313166592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f97d71a71b3%3A0xb491008a38f6ebff!2zMzM1IMSQLiBOZ3V54buFbiBI4buvdSBUaOG7jSwgVMOibiBIxrBuZywgUXXhuq1uIDcsIEjhu5MgQ2jDrSBNaW5oIDcwMDAwMCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1753873088956!5m2!1sen!2s"
            width="100%"
            height="200"
            allowFullScreen
            loading="lazy"
            className="rounded-lg border-0"
          ></iframe>
        </div>
      </div>

      <div className="bg-gray-800 py-4 text-center text-gray-400">
        © {new Date().getFullYear()} MyCinema. All rights reserved.
      </div>
    </footer>
  );
}
