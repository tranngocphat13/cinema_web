// app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="hover:underline">📊 Thống kê</Link>
          <Link href="/admin/users" className="hover:underline">👤 Quản lý tài khoản</Link>
          <Link href="/admin/movies" className="hover:underline">🎬 Quản lý phim</Link>
          <Link href="/admin/showtimes" className="hover:underline">📅 Quản lý lịch chiếu</Link>
          <Link href="/admin/cinemas" className="hover:underline">🏢 Quản lý rạp</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
