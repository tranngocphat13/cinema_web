"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("example@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error || "Đăng nhập thất bại");
    } else {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (session?.user?.role === "Admin") router.push("/admin");
      else router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/auth-redirect" });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-emerald-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
          Login to your account
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition"
          >
            Login now
          </button>

          <p className="text-center text-sm text-gray-500">
            Don’t Have An Account ? {" "}
            <Link href="/register" className="text-emerald-600 hover:underline font-medium">
              Register Here
            </Link>
          </p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold py-3 transition"
          >
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
}