"use client";

import Link from "next/link";
import React from "react";
import { useState } from "react";
import {useRouter} from "next/navigation"

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email})
      });

      const {user} = await resUserExists.json();

      if(user) {
        setError("Tài khoản này đã tồn tại");
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/verify");
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
      console.log("Error during registration:", error);
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
        <h1 className="text-2xl font-bold my-4 uppercase text-center">
          Đăng kí tài khoản
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Họ và tên"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Mật khẩu"
          />
          <button className="bg-green-500 text-white py-2 px-4 rounded cursor-pointer font-bold">
            Đăng kí
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {success}
            </div>
          )}
          <Link href="/login" className="text-sm text-blue-500 text-right">
            Đã có sẵn tài khoản <span className="underline">Đăng nhập</span>
          </Link>
        </form>
      </div>
    </div>
  );
}