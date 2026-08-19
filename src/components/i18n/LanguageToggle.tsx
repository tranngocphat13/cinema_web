"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";
import type { Lang } from "@/components/i18n/i18nProvider";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

interface LanguageOption {
  code: Lang;
  label: string;
  shortLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI", flag: "🇻🇳" },
  { code: "en", label: "English", shortLabel: "EN", flag: "🇺🇸" },
];

export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const selectLang = (l: Lang) => {
    setLang(l);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cx("relative inline-block text-left select-none", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cx(
          "group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300",
          "border border-white/15 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md shadow-sm",
          "hover:border-emerald-400/40 hover:bg-white/15 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
          open && "border-emerald-400/50 bg-white/15 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        )}
        aria-expanded={open}
        aria-label="Select Language"
      >
        <span className="text-sm leading-none">{currentOption.flag}</span>
        <span className="text-white/90 font-medium">{currentOption.shortLabel}</span>
        <ChevronDown
          size={13}
          className={cx(
            "text-white/50 transition-transform duration-300 group-hover:text-white/90",
            open && "rotate-180 text-emerald-300"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={cx(
            "absolute right-0 mt-2.5 w-44 origin-top-right overflow-hidden rounded-2xl p-1.5 z-50",
            "border border-white/15 bg-neutral-950/90 backdrop-blur-2xl",
            "shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_1px_1px_rgba(255,255,255,0.1)]",
            "animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-white/10 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-emerald-400/80">
            <Globe size={11} />
            <span>Ngôn ngữ / Language</span>
          </div>

          <div className="space-y-1">
            {LANGUAGES.map((option) => {
              const isSelected = lang === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => selectLang(option.code)}
                  className={cx(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/25"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{option.flag}</span>
                    <span>{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check size={14} className="text-emerald-300 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
