"use client"
import MainLayout from "@/components/forms/MainLayout";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("login") === "success") {
      setMessage("Đăng nhập thành công!");
      // Xóa thông báo sau 3s
      setTimeout(() => setMessage(""), 3000);
    }
  }, [searchParams]);
  return (
    <div>
      {message && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">{message}</div>
      )}
      <MainLayout />
    </div>
  );
}