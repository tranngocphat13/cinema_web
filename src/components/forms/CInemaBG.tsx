"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function getHighResTMDBUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/\/t\/p\/(w\d+|w780|w500|w300|w1280)\//, "/t/p/original/");
}

export default function CinemaBackground() {
  const [backdrops, setBackdrops] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/movies/now-playing?status=now_playing")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const list: string[] = data
            .map((m: { backdropUrl?: string; posterUrl?: string }) => getHighResTMDBUrl(m.backdropUrl || m.posterUrl))
            .filter((url): url is string => Boolean(url));
          if (list.length > 0) setBackdrops(list);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (backdrops.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backdrops.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [backdrops]);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#121414]" />

      {/* Dynamic Movie Backdrop Layer */}
      {backdrops.length > 0 && (
        <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-25">
          <Image
            key={backdrops[currentIndex]}
            src={backdrops[currentIndex]}
            alt="Cinema backdrop atmosphere"
            fill
            unoptimized
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 animate-fade-in blur-[14px]"
          />
          {/* Deep Cinema Vignette & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121414] via-[#121414]/70 to-[#121414]/85" />
          <div className="absolute inset-0 bg-[#121414]/50" />
        </div>
      )}

      {/* Subtle red & cinema atmospheric lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-10%,rgba(255,36,36,0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_90%_20%,rgba(255,84,72,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_10%_80%,rgba(255,36,36,0.06),transparent_60%)]" />

      {/* Scanlines + subtle grain */}
      <div className="absolute inset-0 opacity-10 cinematic-scanlines" />
      <div className="absolute inset-0 opacity-[0.06] cinematic-grain" />

      <style jsx>{`
        .cinematic-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.08) 0px,
            rgba(255, 255, 255, 0.08) 1px,
            rgba(0, 0, 0, 0) 3px,
            rgba(0, 0, 0, 0) 6px
          );
          mix-blend-mode: overlay;
        }
        .cinematic-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
          animation: grain 2.2s steps(2) infinite;
        }
        @keyframes grain {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2%, 1%); }
          50% { transform: translate(2%, -1%); }
          75% { transform: translate(-1%, -2%); }
          100% { transform: translate(1%, 2%); }
        }
        @keyframes fadeIn {
          from { opacity: 0.2; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1.05); }
        }
        .animate-fade-in {
          animation: fadeIn 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}


