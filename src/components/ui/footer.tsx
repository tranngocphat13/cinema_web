"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-0 text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#020403]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_420px_at_20%_10%,rgba(16,185,129,0.22),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_420px_at_80%_40%,rgba(16,185,129,0.14),transparent_62%)]" />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-40">
                <Image
                  src="/images/logo.png"
                  alt="Cinemas"
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            </div>

            <p className="text-white/70 leading-relaxed text-sm">
              Đặt vé xem phim nhanh chóng – tiện lợi – an toàn.
              <span className="text-white/80 font-medium"> MyCinema</span> mang đến trải nghiệm điện ảnh mượt mà và hiện đại.
            </p>

            <div className="flex items-center gap-3">
              <SocialIcon href="#" label="Facebook">
                <Facebook size={18} />
              </SocialIcon>
              <SocialIcon href="#" label="Instagram">
                <Instagram size={18} />
              </SocialIcon>
              <SocialIcon href="#" label="YouTube">
                <Youtube size={18} />
              </SocialIcon>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold tracking-wide">Liên hệ</h3>

            <div className="space-y-3 text-sm text-white/75">
              <div className="flex gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-300/15">
                  <MapPin size={16} className="text-emerald-200" />
                </span>
                {/* <p>335 Nguyễn Hữu Thọ, Quận 7, TP.HCM</p> */}
              </div>

              <div className="flex gap-3 items-start">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-300/15">
                  <Phone size={16} className="text-emerald-200" />
                </span>
                {/* <p>0339573513</p> */}
              </div>

              <div className="flex gap-3 items-start">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-300/15">
                  <Mail size={16} className="text-emerald-200" />
                </span>
                {/* <p>support@mycinema.vn</p> */}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
                           bg-emerald-400 text-black hover:bg-emerald-300 transition
                           shadow-[0_14px_45px_rgba(16,185,129,0.22)]"
              >
                Gửi liên hệ
              </Link>
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold tracking-wide">Bản đồ</h3>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.036434771447!2d106.69889900795566!3d10.731673313166592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f97d71a71b3%3A0xb491008a38f6ebff!2zMzM1IMSQLiBOZ3V54buFbiBI4buvdSBUaOG7jSwgVMOibiBIxrBuZywgUXXhuq1uIDcsIEjhu5MgQ2jDrSBNaW5oIDcwMDAwMCwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1753873088956!5m2!1sen!2s"
                width="100%"
                height="220"
                allowFullScreen
                loading="lazy"
                className="border-0 grayscale-[20%] contrast-[1.05] saturate-[0.9]"
              />
            </div>
            <p className="text-xs text-white/50">
              *Bản đồ có thể cần internet để hiển thị đầy đủ.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} MyCinema. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white/70 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-white/70 transition">
              Contact
            </Link>
            <Link href="/terms" className="hover:text-white/70 transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl
                 border border-white/10 bg-white/5 text-white/80
                 hover:bg-white/10 hover:text-white transition"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
