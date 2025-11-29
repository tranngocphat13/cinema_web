"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Ticket,
  UserRound,
  Home,
  type LucideIcon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import LanguageToggle from "@/components/i18n/LanguageToggle";
import { useI18n } from "@/components/i18n/i18nProvider";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

type NavItem = {
  href: string;
  tKey: string;
  icon: LucideIcon;
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useI18n();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "User";
  const isAuthed = Boolean(session);

  const navItems: NavItem[] = useMemo(() => {
    const base: NavItem[] = [{ href: "/", tKey: "nav.home", icon: Home }];
    if (isAuthed) base.push({ href: "/user/tickets", tKey: "nav.myTickets", icon: Ticket });
    return base;
  }, [isAuthed]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const linkClass = (href: string) =>
    cx(
      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
      "text-white/75 hover:text-white hover:bg-white/5",
      (pathname === href || (href !== "/" && pathname.startsWith(href))) &&
        "text-white bg-white/10 border border-white/10"
    );

  return (
    <header className="sticky top-0 z-50">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      <nav
        className={cx(
          "backdrop-blur-xl",
          "bg-black/35",
          "border-b border-white/10",
          "shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-9 w-36 sm:w-40">
                <Image
                  src="/images/logo.png"
                  alt="MyCinema"
                  fill
                  sizes="160px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="sr-only">MyCinema</span>
            </Link>

            {/* CENTER: Desktop links */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((it) => {
                const Icon = it.icon;
                return (
                  <Link key={it.href} href={it.href} className={linkClass(it.href)}>
                    <Icon size={16} className="opacity-80" />
                    {t(it.tKey)}
                  </Link>
                );
              })}
            </div>

            {/* RIGHT: Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageToggle />

              {status === "loading" ? (
                <div className="text-white/60 text-sm">{t("common.loading")}</div>
              ) : isAuthed ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2",
                      "text-sm font-medium text-white/85",
                      "bg-white/5 border border-white/10",
                      "hover:bg-white/10 transition"
                    )}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-300/20">
                      <UserRound size={16} className="text-emerald-200" />
                    </span>
                    <span className="max-w-[160px] truncate">{userName}</span>
                    <ChevronDown
                      size={16}
                      className={cx("opacity-70 transition", userMenuOpen && "rotate-180")}
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      className={cx(
                        "absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl",
                        "bg-black/70 backdrop-blur-xl",
                        "border border-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.55)]"
                      )}
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-xs text-white/55">{t("nav.hello")}</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {session?.user?.email || userName}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5"
                        >
                          <UserRound size={16} className="opacity-80" />
                          {t("nav.account")}
                        </Link>

                        <Link
                          href="/user/tickets"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5"
                        >
                          <Ticket size={16} className="opacity-80" />
                          {t("nav.myTickets")}
                        </Link>

                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-200 hover:bg-red-500/10"
                        >
                          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                          {t("nav.logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className={cx(
                      "rounded-full px-4 py-2 text-sm font-semibold",
                      "bg-emerald-400 text-black hover:bg-emerald-300 transition",
                      "shadow-[0_14px_45px_rgba(16,185,129,0.25)]"
                    )}
                  >
                    {t("nav.login")}
                  </Link>

                  <Link
                    href="/auth"
                    className={cx(
                      "rounded-full px-4 py-2 text-sm font-medium",
                      "text-white/85 border border-white/15 bg-white/5",
                      "hover:bg-white/10 transition"
                    )}
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile button */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className={cx(
                "md:hidden inline-flex items-center justify-center",
                "h-10 w-10 rounded-xl border border-white/10 bg-white/5",
                "text-white hover:bg-white/10 transition"
              )}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-white/60 text-sm">Language</div>
                <LanguageToggle />
              </div>

              <div className="h-px bg-white/10" />

              <div className="grid gap-2">
                {navItems.map((it) => {
                  const Icon = it.icon;
                  const active =
                    pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={cx(
                        "flex items-center gap-3 rounded-xl px-4 py-3 border transition",
                        active
                          ? "bg-white/10 border-white/15 text-white"
                          : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                      )}
                    >
                      <Icon size={18} className="opacity-85" />
                      <span className="font-medium">{t(it.tKey)}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-white/10" />

              {status === "loading" ? (
                <div className="text-white/60 text-sm">{t("common.loading")}</div>
              ) : isAuthed ? (
                <div className="space-y-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs text-white/55">{t("nav.hello")}</p>
                    <p className="text-white font-semibold truncate">{userName}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center justify-center rounded-xl px-4 py-3 border border-white/10 bg-white/5 text-white/85 hover:bg-white/10 transition"
                  >
                    {t("nav.account")}
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-center rounded-xl px-4 py-3 bg-red-500/90 hover:bg-red-500 text-white font-semibold transition"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth"
                    className="rounded-xl px-4 py-3 bg-emerald-400 text-black text-center font-semibold hover:bg-emerald-300 transition"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/auth"
                    className="rounded-xl px-4 py-3 border border-white/15 bg-white/5 text-white/85 text-center hover:bg-white/10 transition"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
