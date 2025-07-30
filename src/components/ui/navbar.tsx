"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // icon menu

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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

        {/* Login/Register - Desktop */}
        <div className="hidden md:flex space-x-4">
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
          </div>
        </div>
      )}
    </nav>
  );
}
