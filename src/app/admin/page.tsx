"use client";
import { useState } from "react";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSync() {
    setLoading(true);
    const res = await fetch("/api/movies/sync");
    const data = await res.json();
    setMsg(data.message || data.error);
    setLoading(false);
  }

  return (
    <div className="p-4">
      <button 
        onClick={handleSync} 
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        {loading ? "Đang đồng bộ..." : "Đồng bộ ngay"}
      </button>
      {msg && <p className="mt-2 text-gray-700">{msg}</p>}
    </div>
  );
}
