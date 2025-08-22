"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setStep("verify");
      setSuccess("Mã OTP đã gửi qua email.");
    } else {
      setError(data.message || "Đăng ký thất bại");
    }
  };

  const handleVerify = async () => {
    setError("");
    setSuccess("");

    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess("Xác thực thành công!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setError(data.message || "Lỗi xác thực");
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess("Đã gửi lại mã OTP.");
    } else {
      setError(data.message || "Gửi lại OTP thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 rounded-lg shadow-lg border-t-4 border-green-500 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>

      {step === "register" && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block font-medium mb-1">Họ và tên</label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Mật khẩu</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50"
            disabled={!name || !email || !password}
          >
            Đăng ký
          </button>
        </form>
      )}

      {step === "verify" && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium mb-1">Nhập mã OTP</label>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={handleVerify}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-bold"
          >
            Xác thực mã
          </button>
          <button
            onClick={handleResendOTP}
            className="text-sm text-gray-600 underline"
          >
            Gửi lại mã OTP
          </button>
        </div>
      )}

      {(error || success) && (
        <div
          className={`mt-4 p-2 rounded ${
            error ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {error || success}
        </div>
      )}
    </div>
  );
}
