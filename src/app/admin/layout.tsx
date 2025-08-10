// app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const menuItems = [
  { href: "/admin", label: "Thống kê", icon: "📊" },
  { href: "/admin/user", label: "Quản lý tài khoản", icon: "👤" },
  { href: "/admin/movies", label: "Quản lý phim", icon: "🎬" },
  { href: "/admin/cinemas", label: "Quản lý rạp / chỗ ngồi", icon: "🏢" },
  { href: "/admin/tickets", label: "Quản lý vé", icon: "🎟️" },
  { href: "/admin/genres", label: "Quản lý thể loại", icon: "📂" },
  { href: "/admin/giave", label: "Quản lý giá vé", icon: "💵" },
  { href: "/admin/quangcao", label: "Quản lý quảng cáo", icon: "📢" },
  { href: "/admin/thanhvien", label: "Quản lý thành viên", icon: "👥" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">🎯 Admin</h2>
          <p className="text-gray-400 text-sm">Hệ thống quản trị rạp chiếu phim MyCinema</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 
                  ${isActive ? "bg-gray-700 text-white font-semibold" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto text-xs text-gray-500 pt-4 border-t border-gray-700">
          © {new Date().getFullYear()} Admin Panel
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
