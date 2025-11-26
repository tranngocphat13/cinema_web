"use client";

import React, { useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import { CinemaBg_FilmGrain } from "@/components/forms/CinemaBg_FilmGrain";


type Mode = "login" | "register";
type Step = "register" | "verify";

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function AnimatedCinematicBg() {
  return (
    <>
      <div className="absolute inset-0 bg-[#04140c]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_25%_25%,rgba(16,185,129,0.33),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_70%_15%,rgba(16,185,129,0.22),transparent_62%)]" />
      <div className="absolute inset-0 opacity-90 cinematic-move" />
      <div className="absolute inset-0 pointer-events-none cinematic-scanlines opacity-20" />
      <div className="absolute inset-0 pointer-events-none cinematic-grain opacity-[0.12]" />

      <style jsx>{`
        .cinematic-move {
          background: radial-gradient(
              900px 500px at 10% 15%,
              rgba(16, 185, 129, 0.45),
              transparent 60%
            ),
            radial-gradient(800px 520px at 90% 10%, rgba(16, 185, 129, 0.25), transparent 65%),
            radial-gradient(900px 700px at 60% 90%, rgba(0, 0, 0, 0.7), transparent 60%);
          filter: saturate(110%) contrast(105%);
          animation: drift 10s ease-in-out infinite alternate;
        }
        .cinematic-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.12) 0px,
            rgba(255, 255, 255, 0.12) 1px,
            rgba(0, 0, 0, 0) 3px,
            rgba(0, 0, 0, 0) 6px
          );
          mix-blend-mode: overlay;
        }
        .cinematic-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
          animation: grain 2.2s steps(2) infinite;
        }
        @keyframes drift {
          0% {
            transform: translate3d(-2%, -1%, 0) scale(1.02);
          }
          100% {
            transform: translate3d(2%, 1%, 0) scale(1.06);
          }
        }
        @keyframes grain {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-2%, 1%);
          }
          50% {
            transform: translate(2%, -1%);
          }
          75% {
            transform: translate(-1%, -2%);
          }
          100% {
            transform: translate(1%, 2%);
          }
        }
      `}</style>
    </>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-emerald-300">
      <path
        d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M9 8.5v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AuthPage() {
  const router = useRouter();

  // mode swap login/register
  const [mode, setMode] = useState<Mode>("login");
  const isRegisterMode = mode === "register";

  // login states (giữ y như cũ)
  const [loginEmail, setLoginEmail] = useState("example@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // register + otp states (giữ y như cũ)
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const busy = useMemo(() => false, []);

  const swapTo = (next: Mode) => {
    setMode(next);
    // reset message khi đổi mode
    setLoginError("");
    setRegError("");
    setRegSuccess("");
  };

  // LOGIN (y hệt code bạn)
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: loginEmail,
      password: loginPassword,
    });

    if (res?.error) {
      setLoginError(res.error || "Đăng nhập thất bại");
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

  // REGISTER (y hệt code bạn)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!name || !regEmail || !regPassword) {
      setRegError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: regEmail, password: regPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setStep("verify");
      setRegSuccess("Mã OTP đã gửi qua email.");
    } else {
      setRegError(data.message || "Đăng ký thất bại");
    }
  };

  const handleVerify = async () => {
    setRegError("");
    setRegSuccess("");

    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: regEmail, code: otp }),
    });

    const data = await res.json();
    if (res.ok) {
      setRegSuccess("Xác thực thành công!");
      // về login luôn trong cùng page
      setTimeout(() => {
        swapTo("login");
        setStep("register");
        setLoginEmail(regEmail);
        setLoginPassword("");
      }, 700);
    } else {
      setRegError(data.message || "Lỗi xác thực");
    }
  };

  const handleResendOTP = async () => {
    setRegError("");
    setRegSuccess("");

    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: regEmail }),
    });

    const data = await res.json();
    if (res.ok) setRegSuccess("Đã gửi lại mã OTP.");
    else setRegError(data.message || "Gửi lại OTP thất bại");
  };

  return (
    <div className="min-h-screen w-full
                    bg-[#f6f7f9]
                    bg-[radial-gradient(1200px_600px_at_50%_20%,rgba(16,185,129,0.12),transparent_60%)]">
        <CinemaBg_FilmGrain />
      <div className="min-h-screen w-full flex items-center justify-center p-6">
        <div className="relative w-[min(1120px,92vw)] overflow-hidden rounded-2xl bg-white
                        shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <div className="relative h-[min(740px,86vh)]">
            {/* LEFT HERO (swap) */}
            <div
              className={cx(
                "absolute top-0 left-0 h-full w-1/2 overflow-hidden text-white rounded-l-2xl",
                "transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]",
                isRegisterMode && "translate-x-full"
              )}
            >
              <AnimatedCinematicBg />
              <div className="relative h-full p-10">
                <div className="flex items-center gap-2">
                  <LogoMark />
                  <div className="font-semibold tracking-wide text-emerald-200">Cinemas</div>
                </div>

                <div className="absolute left-10 right-10 bottom-12">
                  <div className="text-[44px] leading-[1.05] italic font-light text-white/95">
                    Welcome.
                    <br />
                    Begin your cinematic
                    <br />
                    adventure now with
                    <br />
                    our ticketing
                    <br />
                    platform!
                  </div>

                  <div className="mt-8 text-white/70 text-sm">
                    {isRegisterMode ? "Already have an account?" : "Don’t have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => swapTo(isRegisterMode ? "login" : "register")}
                      className="text-emerald-200 hover:text-emerald-100 font-medium underline underline-offset-4"
                    >
                      {isRegisterMode ? "Log In" : "Register"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT FORM (swap) */}
            <div
              className={cx(
                "absolute top-0 left-1/2 h-full w-1/2 bg-white rounded-r-2xl",
                "transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]",
                isRegisterMode && "-translate-x-full"
              )}
            >
              <div className="h-full flex items-center justify-center px-10">
                <div className="w-full max-w-[440px]">
                  {/* LOGIN FORM */}
                  {!isRegisterMode && (
                    <>
                      <h1 className="text-3xl font-semibold text-black mb-8">Sign in</h1>

                      <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">Email</span>
                          <div className="relative mt-2">
                            <input
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-black outline-none
                                         focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                            />
                            <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </label>

                        {/* Password */}
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">Password</span>
                          <div className="relative mt-2">
                            <input
                              type={loginShowPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-[15px] text-black outline-none
                                         focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setLoginShowPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                              {loginShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </label>

                        {loginError && (
                          <div className="bg-red-500 text-white w-full text-sm py-2 px-3 rounded-lg">
                            {loginError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={busy}
                          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition disabled:opacity-60"
                        >
                          Sign in
                        </button>

                        <p className="text-center text-sm text-gray-500">
                          Don’t Have An Account ?{" "}
                          <button
                            type="button"
                            onClick={() => swapTo("register")}
                            className="text-emerald-600 hover:underline font-medium"
                          >
                            Register
                          </button>
                        </p>

                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold py-3 transition"
                        >
                          Login with Google
                        </button>
                      </form>
                    </>
                  )}

                  {/* REGISTER FORM (with OTP step) */}
                  {isRegisterMode && (
                    <>
                      <h1 className="text-3xl font-semibold text-black mb-8">
                        {step === "register" ? "Create an account" : "Verify your email"}
                      </h1>

                      {step === "register" && (
                        <form onSubmit={handleRegister} className="space-y-5">
                          {/* Name */}
                          <label className="block">
                            <span className="text-sm font-medium text-gray-700">Full Name</span>
                            <div className="relative mt-2">
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nguyễn Văn A"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-black outline-none
                                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                              />
                              <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                          </label>

                          {/* Email */}
                          <label className="block">
                            <span className="text-sm font-medium text-gray-700">Email</span>
                            <div className="relative mt-2">
                              <input
                                type="email"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-black outline-none
                                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                              />
                              <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                          </label>

                          {/* Password */}
                          <label className="block">
                            <span className="text-sm font-medium text-gray-700">Password</span>
                            <div className="relative mt-2">
                              <input
                                type={regShowPassword ? "text" : "password"}
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="********"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-[15px] text-black outline-none
                                           focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                              />
                              <button
                                type="button"
                                onClick={() => setRegShowPassword((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                              >
                                {regShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </label>

                          {regError && (
                            <div className="bg-red-500 text-white w-full text-sm py-2 px-3 rounded-lg">
                              {regError}
                            </div>
                          )}

                          {regSuccess && (
                            <div className="bg-green-500 text-white w-full text-sm py-2 px-3 rounded-lg">
                              {regSuccess}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={!name || !regEmail || !regPassword}
                            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition disabled:opacity-50"
                          >
                            Register
                          </button>

                          <p className="text-center text-sm text-gray-500">
                            Already have an account?{" "}
                            <button
                              type="button"
                              onClick={() => {
                                swapTo("login");
                                setStep("register");
                              }}
                              className="text-emerald-600 hover:underline font-medium"
                            >
                              Log In
                            </button>
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
                              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-black outline-none
                                         focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                            />
                          </label>

                          {regError && (
                            <div className="bg-red-500 text-white w-full text-sm py-2 px-3 rounded-lg">
                              {regError}
                            </div>
                          )}
                          {regSuccess && (
                            <div className="bg-green-500 text-white w-full text-sm py-2 px-3 rounded-lg">
                              {regSuccess}
                            </div>
                          )}

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

                          <button
                            type="button"
                            onClick={() => {
                              // đổi email hoặc quay lại register
                              setStep("register");
                              setOtp("");
                              setRegError("");
                              setRegSuccess("");
                            }}
                            className="block text-center w-full text-sm text-gray-600 hover:underline"
                          >
                            Back to register
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-black/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
