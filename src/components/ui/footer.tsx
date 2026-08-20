"use client";

import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

export default function Footer() {
  const { t, lang } = useI18n();

  const address =
    lang === "en"
      ? "335 Nguyen Huu Tho St, District 7, Ho Chi Minh City"
      : "335 Nguyễn Hữu Thọ, Quận 7, TP.HCM";

  const phone = "0339573513";
  const email = "support@multiplex.vn";

  return (
    <footer className="mt-16 w-full text-gray-300 border-t border-[#2c2c2c] bg-[#0c0f0f]">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#ff2424]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand + Intro */}
        <div>
          <div className="flex items-center gap-3">
            <div
              className="bg-[#ff2424] text-white px-3.5 py-1 rounded font-black tracking-tight text-xl shadow-[0_0_15px_rgba(255,36,36,0.35)]"
              style={{ transform: "perspective(100px) rotateX(-4deg)", transformOrigin: "bottom" }}
            >
              MULTIPLEX
            </div>
          </div>
          <p className="mt-4 text-white/65 leading-relaxed text-sm">
            {t("footer.intro")}
          </p>

          <div className="mt-6 flex gap-2">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded border border-[#2c2c2c] bg-[#1a1a1a] px-3.5 py-1.5 text-xs text-white/80 hover:border-[#ff2424] hover:text-[#ff2424] transition"
            >
              Facebook
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded border border-[#2c2c2c] bg-[#1a1a1a] px-3.5 py-1.5 text-xs text-white/80 hover:border-[#ff2424] hover:text-[#ff2424] transition"
            >
              Instagram
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded border border-[#2c2c2c] bg-[#1a1a1a] px-3.5 py-1.5 text-xs text-white/80 hover:border-[#ff2424] hover:text-[#ff2424] transition"
            >
              TikTok
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider mb-4 text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff2424]" />
            {t("footer.contact")}
          </h3>

          <div className="space-y-3 text-white/70 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-[#ff2424] shrink-0" />
              <span className="leading-relaxed">{address}</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-[#ff2424] shrink-0" />
              <a href={`tel:${phone}`} className="hover:text-[#ff2424] transition">
                {phone}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[#ff2424] shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-[#ff2424] transition">
                {email}
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider mb-4 text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff2424]" />
            {t("footer.map")}
          </h3>

          <div className="overflow-hidden rounded border border-[#2c2c2c] bg-[#1a1a1a] shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.036434771447!2d106.69889900795566!3d10.731673313166592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f97d71a71b3%3A0xb491008a38f6ebff!2zMzM1IMSQLiBOZ3V54buFbiBI4buvdSBUaOG7jSwgVMOibiBIxrBuZywgUXXhuq1uIDcsIEjhu5MgQ2jDrSBNaW5oIDcwMDAwMCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1753873088956!5m2!1sen!2s"
              width="100%"
              height="180"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full grayscale contrast-125 opacity-85 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              title="Multiplex Cinema map"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#2c2c2c] bg-[#0c0f0f] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/50">
          <div>© {new Date().getFullYear()} MULTIPLEX CINEMA. {t("footer.rights")}</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#ff2424] transition">Privacy Policy</a>
            <a href="#" className="hover:text-[#ff2424] transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

