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
  Film,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

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

interface SearchMovieResult {
  _id: string;
  tmdbId: number;
  title: string;
  posterUrl: string;
  releaseDate?: string;
  status?: string;
  genres?: string[];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t, lang } = useI18n();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchMovieResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "User";
  const isAuthed = Boolean(session);

  const navItems: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { href: "/", tKey: "nav.home", icon: Home },
      { href: "/user/movies/now-playing", tKey: "movies.nowShowingTitle", icon: Film },
      { href: "/user/movies/upcoming", tKey: "movies.comingSoonTitle", icon: Sparkles },
    ];
    if (isAuthed) base.push({ href: "/user/tickets", tKey: "nav.myTickets", icon: Ticket });
    return base;
  }, [isAuthed]);

  // Live Search with Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery.trim())}&lang=${lang}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setSearchOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, lang]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [pathname]);

  const linkClass = (href: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return cx(
      "inline-flex items-center gap-2 px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors uppercase tracking-wider",
      active
        ? "text-[#ff2424] border-b-2 border-[#ff2424] font-bold"
        : "text-[#e2e2e2]/75 hover:text-[#ff2424] hover:bg-white/5 rounded"
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#121414]/90 backdrop-blur-md border-b border-[#2c2c2c]">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#ff2424] to-transparent" />

      <nav className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-3">
          {/* LEFT: Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden text-[#e2e2e2] hover:text-[#ff2424] transition-colors p-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="flex items-center group shrink-0">
              <div
                className="bg-[#ff2424] text-white px-3 py-1 rounded font-black tracking-tight text-base sm:text-lg shadow-[0_0_15px_rgba(255,36,36,0.35)] transition-transform group-hover:scale-105"
                style={{ transform: "perspective(100px) rotateX(-4deg)", transformOrigin: "bottom" }}
              >
                MULTIPLEX
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-5">
            {navItems.map((it) => {
              const Icon = it.icon;
              return (
                <Link key={it.href} href={it.href} className={linkClass(it.href)}>
                  <Icon size={15} className="opacity-75" />
                  {t(it.tKey)}
                </Link>
              );
            })}
          </div>

          {/* SEARCH BAR (Desktop) */}
          <div className="hidden sm:block relative flex-1 max-w-xs lg:max-w-sm" ref={searchRef}>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder={lang === "en" ? "Search movies..." : "Tìm kiếm phim..."}
                value={searchQuery}
                onFocus={() => {
                  if (searchResults.length > 0) setSearchOpen(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161818] border border-[#2c2c2c] focus:border-[#ff2424] rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Live Search Autocomplete Dropdown */}
            {searchOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-[#161818] border border-[#2c2c2c] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-50 max-h-96 overflow-y-auto hide-scrollbar">
                {searchLoading ? (
                  <div className="p-4 text-center text-xs text-white/50 flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-[#ff2424] border-t-transparent rounded-full animate-spin" />
                    <span>{t("common.loading")}</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-white/50">
                    {lang === "en" ? "No movies found." : "Không tìm thấy phim phù hợp."}
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((m) => (
                      <Link
                        key={m.tmdbId}
                        href={`/user/movies/${m.tmdbId}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors group"
                      >
                        <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-black/50 shrink-0 border border-white/10">
                          {m.posterUrl ? (
                            <Image
                              src={m.posterUrl}
                              alt={m.title}
                              fill
                              sizes="40px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-white/30">
                              No Pic
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white group-hover:text-[#ff2424] transition-colors truncate">
                            {m.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                              m.status === "upcoming" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}>
                              {m.status === "upcoming" ? (lang === "en" ? "Upcoming" : "Sắp chiếu") : (lang === "en" ? "Now Playing" : "Đang chiếu")}
                            </span>
                            {m.genres && m.genres.length > 0 && (
                              <span className="text-[10px] text-white/40 truncate">
                                {m.genres.slice(0, 2).join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2.5">
            <LanguageToggle />

            {status === "loading" ? (
              <div className="text-white/60 text-xs">{t("common.loading")}</div>
            ) : isAuthed ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded px-3 py-1.5",
                    "text-xs lg:text-sm font-medium text-white/90",
                    "bg-[#1e2020] border border-[#2c2c2c]",
                    "hover:border-[#ff2424] hover:text-[#ff2424] transition"
                  )}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#ff2424]/20 text-[#ff2424]">
                    <UserRound size={13} />
                  </span>
                  <span className="max-w-[100px] lg:max-w-[130px] truncate">{userName}</span>
                  <ChevronDown
                    size={13}
                    className={cx("opacity-70 transition", userMenuOpen && "rotate-180")}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className={cx(
                      "absolute right-0 mt-2 w-56 overflow-hidden rounded-xl",
                      "bg-[#1a1a1a] backdrop-blur-xl",
                      "border border-[#2c2c2c] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50"
                    )}
                  >
                    <div className="px-4 py-3 border-b border-[#2c2c2c]">
                      <p className="text-xs text-white/50">{t("nav.hello")}</p>
                      <p className="text-sm font-bold text-white truncate">
                        {session?.user?.email || userName}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/user/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <UserRound size={16} className="text-[#ff2424]" />
                        {t("nav.account")}
                      </Link>

                      <Link
                        href="/user/tickets"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Ticket size={16} className="text-[#ff2424]" />
                        {t("nav.myTickets")}
                      </Link>

                      <div className="h-px bg-[#2c2c2c] my-1" />

                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-[#ff2424]" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className={cx(
                    "rounded px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider",
                    "bg-[#ff2424] text-white hover:bg-[#e01e1e] transition-colors",
                    "shadow-[0_0_15px_rgba(255,36,36,0.3)]"
                  )}
                >
                  {t("nav.login")}
                </Link>

                <Link
                  href="/auth"
                  className={cx(
                    "hidden sm:inline-flex rounded px-3 py-1.5 text-xs sm:text-sm font-medium uppercase tracking-wider",
                    "text-white/85 border border-[#2c2c2c] bg-[#1e2020]",
                    "hover:border-white/40 hover:text-white transition"
                  )}
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2c2c2c] bg-[#121414]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder={lang === "en" ? "Search movies..." : "Tìm kiếm phim..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161818] border border-[#2c2c2c] focus:border-[#ff2424] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-colors"
              />
            </div>

            {/* Mobile Search Results */}
            {searchResults.length > 0 && searchQuery && (
              <div className="bg-[#1a1a1a] rounded-xl border border-[#2c2c2c] max-h-60 overflow-y-auto divide-y divide-white/5">
                {searchResults.map((m) => (
                  <Link
                    key={m.tmdbId}
                    href={`/user/movies/${m.tmdbId}`}
                    onClick={() => {
                      setMobileOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-white/5 text-xs"
                  >
                    <div className="relative w-8 h-11 rounded bg-black/50 shrink-0 overflow-hidden">
                      {m.posterUrl && <Image src={m.posterUrl} alt={m.title} fill className="object-cover" sizes="32px" />}
                    </div>
                    <span className="font-bold text-white truncate">{m.title}</span>
                  </Link>
                ))}
              </div>
            )}

            <div className="grid gap-2">
              {navItems.map((it) => {
                const Icon = it.icon;
                const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={cx(
                      "flex items-center gap-3 rounded-xl px-4 py-3 border transition text-xs font-semibold uppercase tracking-wider",
                      active
                        ? "bg-[#ff2424]/10 border-[#ff2424] text-[#ff2424]"
                        : "bg-[#1a1a1a] border-[#2c2c2c] text-white/80 hover:border-white/30"
                    )}
                  >
                    <Icon size={16} className={active ? "text-[#ff2424]" : "opacity-75"} />
                    <span>{t(it.tKey)}</span>
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-[#2c2c2c]" />

            {isAuthed ? (
              <div className="space-y-2">
                <div className="rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] px-4 py-3">
                  <p className="text-xs text-white/50">{t("nav.hello")}</p>
                  <p className="text-white font-bold truncate">{userName}</p>
                </div>

                <Link
                  href="/user/profile"
                  className="flex items-center justify-center rounded-xl px-4 py-2.5 border border-[#2c2c2c] bg-[#1e2020] text-xs font-semibold text-white/90 hover:bg-white/5 transition"
                >
                  {t("nav.account")}
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center rounded-xl px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs transition"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth"
                  className="rounded-xl px-4 py-2.5 bg-[#ff2424] text-white text-center font-bold text-xs uppercase tracking-wider"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/auth"
                  className="rounded-xl px-4 py-2.5 border border-[#2c2c2c] bg-[#1e2020] text-white/85 text-center font-medium text-xs uppercase tracking-wider"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

