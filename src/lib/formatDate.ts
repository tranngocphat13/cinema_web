export type Lang = "vi" | "en";

/**
 * Format standard release date
 * VI: "19/08/2026"
 * EN: "Aug 19, 2026"
 */
export function formatReleaseDate(
  dateInput?: string | Date | null,
  lang: Lang = "vi"
): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "";

  if (lang === "en") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format day of week and month/day for showtime date picker buttons
 */
export function formatShowtimePickerDate(
  dateInput: string | Date,
  lang: Lang = "vi"
): { dow: string; md: string; y: string; fullDate: string } {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) {
    return { dow: "", md: "", y: "", fullDate: "" };
  }

  if (lang === "en") {
    const dow = d.toLocaleDateString("en-US", { weekday: "short" });
    const md = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const y = String(d.getFullYear());
    const fullDate = `${dow}, ${md} ${y}`;
    return { dow, md, y, fullDate };
  }

  // Tiếng Việt
  const daysVi = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const dow = daysVi[d.getDay()] || "Hôm nay";
  const dayNum = String(d.getDate()).padStart(2, "0");
  const monthNum = String(d.getMonth() + 1).padStart(2, "0");
  const md = `${dayNum} Thg ${monthNum}`;
  const y = String(d.getFullYear());
  const fullDate = `${dow}, ${dayNum}/${monthNum}/${y}`;

  return { dow, md, y, fullDate };
}

/**
 * Format showtime hours (e.g. 19:30 or 7:30 PM)
 */
export function formatShowtimeHour(
  isoString: string,
  lang: Lang = "vi"
): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";

  if (lang === "en") {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
