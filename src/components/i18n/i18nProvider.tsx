"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries } from "@/lib/i18n/dictionaries";

export type Lang = "vi" | "en";

type DictNode = Record<string, unknown>;
type Dictionaries = Record<Lang, DictNode>;

type I18nCtx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (!isRecord(acc)) return undefined;
    return acc[k];
  }, obj);
}

function readCookieLang(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)lang=(vi|en)(?:;|$)/);
  return (match?.[1] as Lang) || null;
}

function normalizeLang(v: unknown, fallback: Lang): Lang {
  return v === "en" ? "en" : v === "vi" ? "vi" : fallback;
}

export function I18nProvider({
  children,
  initialLang = "vi",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return initialLang;
    const cookie = readCookieLang();
    const ls = localStorage.getItem("lang");
    return normalizeLang(cookie || ls, initialLang);
  });

  const setLang = (next: Lang) => setLangState(next);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("lang", lang);
    document.cookie = `lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    const dicts = dictionaries as unknown as Dictionaries;

    return (key: string) => {
      const v = getByPath(dicts[lang], key);
      return typeof v === "string" ? v : key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider />");
  return ctx;
}
