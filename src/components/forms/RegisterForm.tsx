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
    setError(""); setSuccess("");

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
    setError(""); setSuccess("");

    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otp }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess("Xác thực thành công!");
      setTimeout(() => {
        router.push("/login"); // <-- tự động chuyển sang trang login sau 2 giây
      }, 2000);
    } else {
      setError(data.message || "Lỗi xác thực");
    }
  };

  const handleResendOTP = async () => {
    setError(""); setSuccess("");
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
    <div className="max-w-md mx-auto mt-12 p-6 rounded-lg shadow-lg border-t-4 border-green-500">
      <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>

      {step === "register" && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input type="text" placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-green-500 text-white py-2 rounded font-bold">Đăng ký</button>
        </form>
      )}

      {step === "verify" && (
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Nhập mã OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button onClick={handleVerify} className="bg-blue-500 text-white py-2 rounded font-bold">
            Xác thực mã
          </button>
          <button onClick={handleResendOTP} className="text-sm text-gray-600 underline">
            Gửi lại mã OTP
          </button>
        </div>
      )}

      {(error || success) && (
        <div className={`mt-4 p-2 rounded ${error ? "bg-red-500" : "bg-green-500"} text-white`}>
          {error || success}
        </div>
      )}
    </div>
  );
}
