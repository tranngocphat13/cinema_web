"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";
import type { Lang } from "@/components/i18n/i18nProvider";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = (l: Lang) => {
    setLang(l);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-sm text-white/85
                   hover:bg-white/10 transition"
      >
        <Languages size={16} className="text-emerald-200" />
        <span className="font-semibold">{lang === "vi" ? "VI" : "EN"}</span>
        <ChevronDown size={16} className="text-white/60" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
          <button
            onClick={() => pick("vi")}
            className={cx(
              "w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition",
              lang === "vi" ? "text-emerald-200" : "text-white/80"
            )}
          >
            🇻🇳 Tiếng Việt
          </button>
          <button
            onClick={() => pick("en")}
            className={cx(
              "w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition",
              lang === "en" ? "text-emerald-200" : "text-white/80"
            )}
          >
            🇺🇸 English
          </button>
        </div>
      )}
    </div>
  );
}
