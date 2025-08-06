"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Xác thực thành công! Đang chuyển hướng...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "Xác thực thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-blue-400 w-[400px]">
        <h1 className="text-2xl font-bold text-center mb-4">Xác thực tài khoản</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border p-2 rounded"
          />
          <button className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Xác thực
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
        </form>
      </div>
    </div>
  );
}
