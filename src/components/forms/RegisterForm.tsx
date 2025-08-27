"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, User } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setTimeout(() => router.push("/login"), 2000);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-emerald-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
          {step === "register" ? "Create an account" : "Verify your email"}
        </h1>

        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Full Name</span>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 outline-none px-4 py-3 text-[15px]"
                />
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </label>

            {/* Email */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <div className="relative mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 outline-none px-4 py-3 text-[15px]"
                />
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 outline-none px-4 py-3 text-[15px] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="bg-red-500 text-white w-full text-sm py-2 px-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!name || !email || !password}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition disabled:opacity-50"
            >
              Register
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-emerald-600 hover:underline font-medium cursor-pointer"
              >
                Login Here
              </span>
            </p>
          </form>
        )}

        {step === "verify" && (
          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Enter OTP Code</span>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 outline-none px-4 py-3 text-[15px]"
              />
            </label>
            <button
              onClick={handleVerify}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition"
            >
              Verify
            </button>
            <button
              onClick={handleResendOTP}
              className="block text-center w-full text-sm text-gray-600 hover:underline"
            >
              Resend OTP
            </button>
          </div>
        )}

        {(error || success) && (
          <div
            className={`mt-4 p-2 rounded text-center ${
              error ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {error || success}
          </div>
        )}
      </div>
    </div>
  );
}
