"use client";

import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function Footer() {
  const { t, lang } = useI18n();

  // Bạn có thể tách các info này ra config/env sau
  const address =
    lang === "en"
      ? "335 Nguyen Huu Tho St, District 7, Ho Chi Minh City"
      : "335 Nguyễn Hữu Thọ, Quận 7, TP.HCM";

  const phone = "0339573513";
  const email = "support@mycinema.vn";

  return (
    <footer className="mt-0 text-gray-200">
      {/* top glow line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      <div
        className={cx(
          "bg-black/35 backdrop-blur-xl",
          "border-t border-white/10",
          "shadow-[0_-10px_40px_rgba(0,0,0,0.35)]"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand + Intro */}
          <div>
            <h2 className="text-3xl font-extrabold text-emerald-300 drop-shadow">
              MyCinema
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              {t("footer.intro")}
            </p>

            <div className="mt-6 flex gap-2">
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition"
              >
                Facebook
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition"
              >
                Instagram
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t("footer.contact")}
            </h3>

            <div className="space-y-3 text-white/75">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-emerald-200/90" />
                <span className="leading-relaxed">{address}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-200/90" />
                <a href={`tel:${phone}`} className="hover:text-emerald-200 transition">
                  {phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-200/90" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-emerald-200 transition"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t("footer.map")}
            </h3>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.036434771447!2d106.69889900795566!3d10.731673313166592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f97d71a71b3%3A0xb491008a38f6ebff!2zMzM1IMSQLiBOZ3V54buFbiBI4buvdSBUaOG7jSwgVMOibiBIxrBuZywgUXXhuq1uIDcsIEjhu5MgQ2jDrSBNaW5oIDcwMDAwMCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1753873088956!5m2!1sen!2s"
                width="100%"
                height="220"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full"
                title="MyCinema map"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-white/50 text-sm">
            © {new Date().getFullYear()} MyCinema. {t("footer.rights")}
          </div>
        </div>
      </div>
    </footer>
  );
}
