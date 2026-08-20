"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  UserRound,
  Shield,
  Ticket,
  Award,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  points: number;
  membershipTier: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { t, lang } = useI18n();

  const [activeTab, setActiveTab] = useState<"info" | "security" | "membership">("info");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setProfile(data);
            setName(data.name || "");
            setPhone(data.phone || "");
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();

      if (res.ok) {
        setInfoMessage({ type: "success", text: lang === "en" ? "Profile updated successfully!" : "Cập nhật thông tin thành công!" });
        setProfile((prev) => (prev ? { ...prev, name: data.user.name, phone: data.user.phone } : null));
      } else {
        setInfoMessage({ type: "error", text: data.error || "Có lỗi xảy ra" });
      }
    } catch {
      setInfoMessage({ type: "error", text: "Không thể kết nối đến máy chủ" });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword !== confirmPassword) {
      setPassMessage({
        type: "error",
        text: lang === "en" ? "New passwords do not match!" : "Mật khẩu xác nhận không khớp!",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPassMessage({
        type: "error",
        text: lang === "en" ? "Password must be at least 6 characters!" : "Mật khẩu phải có ít nhất 6 ký tự!",
      });
      return;
    }

    setSavingPass(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setPassMessage({ type: "success", text: data.message || "Đổi mật khẩu thành công!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassMessage({ type: "error", text: data.error || "Đổi mật khẩu thất bại" });
      }
    } catch {
      setPassMessage({ type: "error", text: "Không thể kết nối đến máy chủ" });
    } finally {
      setSavingPass(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#ff2424]/10 border border-[#ff2424]/30 flex items-center justify-center text-[#ff2424] mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {lang === "en" ? "Please sign in" : "Vui lòng đăng nhập"}
        </h1>
        <p className="text-white/60 text-sm max-w-md mb-6">
          {lang === "en"
            ? "You need to be logged in to view your profile and manage your membership."
            : "Bạn cần đăng nhập để xem thông tin cá nhân và quản lý tài khoản thành viên."}
        </p>
        <Link
          href="/auth"
          className="bg-[#ff2424] hover:bg-[#e01e1e] text-white font-bold px-8 py-3 rounded text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,36,36,0.35)]"
        >
          {t("nav.login")}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ff2424] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const points = profile?.points ?? 120;
  const tier = profile?.membershipTier || "Standard";
  const nextTierPoints = 500;
  const progress = Math.min(100, Math.round((points / nextTierPoints) * 100));

  return (
    <div className="min-h-screen text-[#e2e2e2] pb-20 pt-6 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#ff2424] text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>{lang === "en" ? "Back to Home" : "Quay lại trang chủ"}</span>
        </Link>

        <Link
          href="/user/movies/now-playing"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <Home size={13} />
          <span>{lang === "en" ? "Browse Movies" : "Xem phim đang chiếu"}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2c2c2c] bg-gradient-to-r from-[#1a1a1a] via-[#161818] to-[#121414] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,rgba(255,36,36,0.15),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ff2424] to-[#990000] p-0.5 shadow-[0_0_20px_rgba(255,36,36,0.4)]">
              <div className="w-full h-full rounded-[14px] bg-[#121414] flex items-center justify-center text-white font-black text-2xl">
                {(profile?.name || session?.user?.name || "U").charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {profile?.name || session?.user?.name}
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#ff2424]/20 border border-[#ff2424]/40 text-[#ff2424] px-2.5 py-0.5 rounded-full">
                  {tier} Member
                </span>
              </div>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                <Mail size={13} className="opacity-60" />
                {profile?.email || session?.user?.email}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 bg-[#1e2020] hover:bg-[#2c2c2c] border border-[#2c2c2c] text-white/80 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
            >
              <Home size={15} />
              <span>{t("nav.home")}</span>
            </Link>

            <Link
              href="/user/tickets"
              className="flex items-center gap-2 bg-[#ff2424]/10 hover:bg-[#ff2424] border border-[#ff2424]/30 hover:border-[#ff2424] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md group"
            >
              <Ticket size={16} className="text-[#ff2424] group-hover:text-white transition-colors" />
              <span>{t("nav.myTickets")}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Membership Card & Stats */}
        <div className="space-y-6">
          {/* Virtual Membership Card */}
          <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-[#280c0c] via-[#1a1414] to-[#121414] border border-[#ff2424]/30 shadow-[0_0_30px_rgba(255,36,36,0.15)] flex flex-col justify-between h-56 group hover:border-[#ff2424]/60 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#ff2424]" />
                <span className="font-mono font-black text-sm tracking-widest text-white uppercase">
                  MULTIPLEX PASS
                </span>
              </div>
              <Award size={24} className="text-[#ff2424]" />
            </div>

            <div>
              <div className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">
                {lang === "en" ? "REWARD POINTS" : "ĐIỂM TÍCH LŨY"}
              </div>
              <div className="text-3xl font-black text-white mt-0.5 flex items-baseline gap-2">
                <span>{points.toLocaleString()}</span>
                <span className="text-xs font-normal text-[#ff2424]">pts</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-white/60 mb-1.5">
                <span>Hạng: {tier}</span>
                <span>Tiến trình lên Silver: {points}/{nextTierPoints}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff2424] to-[#ff7a70] rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Membership Benefits */}
          <div className="rounded-2xl p-5 border border-[#2c2c2c] bg-[#161818] space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-[#ff2424]" />
              {lang === "en" ? "Member Privileges" : "Đặc quyền thành viên"}
            </h3>
            <ul className="text-xs text-white/70 space-y-2.5">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[#ff2424] shrink-0" />
                <span>Tích lũy 5% giá trị mỗi vé xem phim</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[#ff2424] shrink-0" />
                <span>Đổi điểm nhận vé & bắp nước miễn phí</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[#ff2424] shrink-0" />
                <span>Quà tặng bắp nước dịp sinh nhật</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Settings Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#2c2c2c] gap-4">
            <button
              onClick={() => setActiveTab("info")}
              className={`pb-3 px-2 text-sm font-bold tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === "info"
                  ? "border-[#ff2424] text-[#ff2424]"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              <UserRound size={16} />
              {lang === "en" ? "Personal Info" : "Thông tin cá nhân"}
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`pb-3 px-2 text-sm font-bold tracking-wider transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === "security"
                  ? "border-[#ff2424] text-[#ff2424]"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              <Shield size={16} />
              {lang === "en" ? "Security & Password" : "Bảo mật & Mật khẩu"}
            </button>
          </div>

          {/* Tab 1: Personal Info */}
          {activeTab === "info" && (
            <form onSubmit={handleUpdateInfo} className="rounded-2xl p-6 border border-[#2c2c2c] bg-[#161818] space-y-5">
              {infoMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
                    infoMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {infoMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{infoMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  {lang === "en" ? "Full Name" : "Họ và tên"}
                </label>
                <div className="flex items-center gap-3 w-full bg-[#121414] border border-[#2c2c2c] focus-within:border-[#ff2424] rounded-xl px-4 py-1 transition-colors">
                  <UserRound size={17} className="text-white/40 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-0 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-3 w-full bg-[#121414]/50 border border-[#2c2c2c] rounded-xl px-4 py-1">
                  <Mail size={17} className="text-white/30 shrink-0" />
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full bg-transparent border-0 py-2.5 text-sm text-white/50 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-1.5">
                  {lang === "en" ? "Email cannot be changed." : "Email được dùng làm tài khoản đăng nhập và không thể thay đổi."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  {lang === "en" ? "Phone Number" : "Số điện thoại"}
                </label>
                <div className="flex items-center gap-3 w-full bg-[#121414] border border-[#2c2c2c] focus-within:border-[#ff2424] rounded-xl px-4 py-1 transition-colors">
                  <Phone size={17} className="text-white/40 shrink-0" />
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent border-0 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingInfo}
                  className="bg-[#ff2424] hover:bg-[#e01e1e] disabled:opacity-50 text-white font-bold px-7 py-3 rounded-xl text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,36,36,0.3)] flex items-center gap-2"
                >
                  {savingInfo && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{t("common.save")}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Security & Password */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="rounded-2xl p-6 border border-[#2c2c2c] bg-[#161818] space-y-5">
              {passMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
                    passMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}
                >
                  {passMessage.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{passMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  {lang === "en" ? "Current Password" : "Mật khẩu hiện tại"}
                </label>
                <div className="flex items-center gap-3 w-full bg-[#121414] border border-[#2c2c2c] focus-within:border-[#ff2424] rounded-xl px-4 py-1 transition-colors">
                  <Lock size={17} className="text-white/40 shrink-0" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-transparent border-0 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="text-white/40 hover:text-white shrink-0 p-1"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  {lang === "en" ? "New Password" : "Mật khẩu mới"}
                </label>
                <div className="flex items-center gap-3 w-full bg-[#121414] border border-[#2c2c2c] focus-within:border-[#ff2424] rounded-xl px-4 py-1 transition-colors">
                  <Lock size={17} className="text-white/40 shrink-0" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    placeholder={lang === "en" ? "At least 6 characters" : "Tối thiểu 6 ký tự"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-transparent border-0 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="text-white/40 hover:text-white shrink-0 p-1"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  {lang === "en" ? "Confirm New Password" : "Xác nhận mật khẩu mới"}
                </label>
                <div className="flex items-center gap-3 w-full bg-[#121414] border border-[#2c2c2c] focus-within:border-[#ff2424] rounded-xl px-4 py-1 transition-colors">
                  <Lock size={17} className="text-white/40 shrink-0" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent border-0 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="bg-[#ff2424] hover:bg-[#e01e1e] disabled:opacity-50 text-white font-bold px-7 py-3 rounded-xl text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,36,36,0.3)] flex items-center gap-2"
                >
                  {savingPass && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{lang === "en" ? "Update Password" : "Đổi mật khẩu"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
