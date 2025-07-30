import React from "react";
import Link from "next/link";

export default function LoginForm() {
  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
        <h1 className="text-2xl font-bold my-4 uppercase text-center">Xin chào!</h1>

        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button className="bg-green-500 text-white py-2 px-4 rounded cursor-pointer font-bold">
            Đăng nhập
          </button>
          <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
            Error message
          </div>

          <Link href="/register" className="text-sm text-blue-500 text-right">
            Quên mật khẩu? <span className="underline">Đăng ký</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
