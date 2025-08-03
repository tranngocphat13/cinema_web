"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Người dùng";

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          MyCinema
        </Link>

        {/* Menu - Desktop */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-green-500">
            Trang chủ
          </Link>
          <Link href="/movies" className="hover:text-green-500">
            Phim
          </Link>
          <Link href="/schedule" className="hover:text-green-500">
            Lịch chiếu
          </Link>
          <Link href="/booking" className="hover:text-green-500">
            Đặt vé
          </Link>
        </div>

        {/* Auth / User - Desktop */}
        <div className="hidden md:flex space-x-4 items-center">
          {status === "loading" ? (
            <p>Đang tải...</p>
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="font-semibold text-gray-700 px-4 py-2 border rounded hover:bg-gray-100"
              >
                Xin chào, {userName}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full bg-white border rounded shadow-md w-40 mt-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
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
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Hamburger - Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="flex flex-col space-y-4 p-4">
            <Link href="/" className="hover:text-green-500">
              Trang chủ
            </Link>
            <Link href="/movies" className="hover:text-green-500">
              Phim
            </Link>
            <Link href="/schedule" className="hover:text-green-500">
              Lịch chiếu
            </Link>
            <Link href="/booking" className="hover:text-green-500">
              Đặt vé
            </Link>

            {session ? (
              <>
                <span className="font-semibold text-gray-700">
                  Xin chào, {userName}
                </span>
                <Link
                  href="/profile"
                  className="px-4 py-2 border rounded text-center hover:bg-gray-100"
                >
                  Tài khoản
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 border rounded text-center hover:bg-gray-100"
                >
                  Vé của tôi
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 bg-red-500 text-white rounded text-center hover:bg-red-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-green-500 text-white rounded text-center hover:bg-green-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 border rounded text-center hover:bg-gray-100"
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
