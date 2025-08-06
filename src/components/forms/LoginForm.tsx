"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      // Lấy session để biết role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      // Redirect theo role
      if (session?.user?.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
        <h1 className="text-2xl font-bold my-4 uppercase text-center">
          Xin chào!
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          <button className="bg-green-500 text-white py-2 px-4 rounded cursor-pointer font-bold">
            Đăng nhập
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link href="/register" className="text-sm text-blue-500 text-right">
            Quên mật khẩu? <span className="underline">Đăng ký</span>
          </Link>

          <button
            type="button"
            onClick={() =>
              signIn("google", { callbackUrl: "/" }) // Google mặc định về dashboard
            }
            className="bg-red-500 text-white py-2 px-4 rounded font-bold cursor-pointer"
          >
            Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  );
}
