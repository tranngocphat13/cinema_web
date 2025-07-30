import Link from "next/link";
import React from "react";

export default function RegisterForm() {
  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
        <h1 className="text-2xl font-bold my-4 uppercase text-center">
          Đăng kí tài khoản
        </h1>

        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Họ và tên" />
          <input type="text" placeholder="Email" />
          <input type="password" placeholder="Mật khẩu" />
          <button className="bg-green-500 text-white py-2 px-4 rounded cursor-pointer font-bold">
            Đăng kí
          </button>
          <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
            Error message
          </div>

          <Link href="/" className="text-sm text-blue-500 text-right">
            Đã có sẵn tài khoản <span className="underline">Đăng nhập</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
