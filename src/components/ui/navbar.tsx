"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Người dùng";

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          MyCinema
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-green-500">Trang chủ</Link>
          <Link href="/user/movies" className="hover:text-green-500">Phim</Link>
          <Link href="/schedule" className="hover:text-green-500">Lịch chiếu</Link>
          <Link href="/booking" className="hover:text-green-500">Đặt vé</Link>
        </div>

        {/* User Menu Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {status === "loading" ? (
            <p>Đang tải...</p>
          ) : session ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="font-semibold text-gray-700 px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Xin chào, {userName}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Tài khoản
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Mobile */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="md:hidden text-gray-700"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="flex flex-col space-y-4 p-4">
            <Link href="/" className="hover:text-green-500">Trang chủ</Link>
            <Link href="/movies" className="hover:text-green-500">Phim</Link>
            <Link href="/schedule" className="hover:text-green-500">Lịch chiếu</Link>
            <Link href="/booking" className="hover:text-green-500">Đặt vé</Link>

            {session ? (
              <>
                <span className="font-semibold text-gray-700">Xin chào, {userName}</span>
                <Link
                  href="/profile"
                  className="px-4 py-2 border rounded-lg text-center hover:bg-gray-100"
                >
                  Tài khoản
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 border rounded-lg text-center hover:bg-gray-100"
                >
                  Vé của tôi
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-center hover:bg-red-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-center hover:bg-green-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 border rounded-lg text-center hover:bg-gray-100"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
