import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

import CinemaBackground from "@/components/forms/CInemaBG";
import AppProviders from "@/components/AppProviders";
import { getServerLang } from "@/lib/i18n/server";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Multiplex Cinema - Book Movie Tickets Online",
  description: "Premier multiplex cinema booking system",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getServerLang();

  return (
    <html lang={lang} className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${hankenGrotesk.className} ${hankenGrotesk.variable} antialiased min-h-screen relative bg-[#121414] text-[#e2e2e2]`}>
        <CinemaBackground />
        <div className="relative z-10 min-h-screen flex flex-col justify-between">
          <AppProviders initialLang={lang}>{children}</AppProviders>
        </div>
      </body>
    </html>
  );
}
