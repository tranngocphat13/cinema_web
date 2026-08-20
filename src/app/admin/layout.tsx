// app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react"; // 👈 thêm signOut

const menuItems = [
  { href: "/admin", label: "Thống kê", icon: "📊" },
  { href: "/admin/user", label: "Quản lý tài khoản", icon: "👤" },
  { href: "/admin/movies", label: "Quản lý phim", icon: "🎬" },
  { href: "/admin/cinemas", label: "Quản lý rạp / chỗ ngồi", icon: "🏢" },
  { href: "/admin/tickets", label: "Quản lý vé", icon: "🎟️" },
  { href: "/admin/genres", label: "Quản lý thể loại", icon: "📂" },
  { href: "/admin/showtimes", label: "Quản lý suất chiếu", icon: "💵" },
  { href: "/admin/quangcao", label: "Quản lý quảng cáo", icon: "📢" },
  { href: "/admin/thanhvien", label: "Quản lý thành viên", icon: "👥" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 flex flex-col transform 
          transition-transform duration-300 z-50 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0`}
      >
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold">🎯 Admin</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            ✖
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 
                  ${
                    isActive
                      ? "bg-gray-700 text-white font-semibold"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* 👉 Nút đăng xuất */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2 mt-4 rounded-md bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
          >
            🚪 <span>Đăng xuất</span>
          </button>
        </nav>

        <div className="mt-auto text-xs text-gray-500 pt-4 border-t border-gray-700">
          © {new Date().getFullYear()} Admin Panel
        </div>
      </aside>

      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm text-gray-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-black"
            >
              ☰
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Trang Quản Trị</h1>
          </div>

          <div className="text-xl font-medium text-gray-700">
            Xin chào,{" "}
            <span className="font-semibold text-blue-600">
              {session?.user?.name}
            </span>
          </div>
        </header>

        {/* Main */}
        <main className="p-6 flex-1 text-gray-900">{children}</main>
      </div>
    </div>
  );
}
