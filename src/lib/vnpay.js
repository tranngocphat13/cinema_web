// src/lib/vnpay.js
import crypto from "crypto";
import qs from "qs";

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).map((k) => encodeURIComponent(k)).sort();
  keys.forEach((k) => {
    sorted[k] = encodeURIComponent(obj[k]).replace(/%20/g, "+");
  });
  return sorted;
}

// ✅ YYYYMMDDHHmmss theo giờ VN (GMT+7) — không phụ thuộc timezone của Vercel
function vnpDateVN(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  // cộng 7h rồi dùng getUTC* để “đóng băng” timezone
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return (
    `${vn.getUTCFullYear()}` +
    `${pad(vn.getUTCMonth() + 1)}` +
    `${pad(vn.getUTCDate())}` +
    `${pad(vn.getUTCHours())}` +
    `${pad(vn.getUTCMinutes())}` +
    `${pad(vn.getUTCSeconds())}`
  );
}

export function buildVnpayUrl({ amount, orderId, orderInfo, ipAddr, bankCode, locale = "vn" }) {
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = String(process.env.VNP_HASH_SECRET || "").trim();
  const vnpUrl = process.env.VNP_PAYMENT_URL;
  const returnUrl = process.env.VNP_RETURN_URL;
  const ipnUrl = process.env.VNP_IPN_URL; // optional

  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
    throw new Error("Thiếu cấu hình VNPAY");
  }

  const now = new Date();
  const createDate = vnpDateVN(now);
  const expireDate = vnpDateVN(new Date(now.getTime() + 15 * 60 * 1000)); // 15 phút

  const safeInfo = (orderInfo || `Thanh toan ${orderId}`)
    .replace(/[^\w\s:,.()-]/g, " ")
    .trim();

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: Math.round(Number(amount)) * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: safeInfo,
    vnp_OrderType: "other",
    vnp_Locale: locale,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
    ...(bankCode ? { vnp_BankCode: bankCode } : {}),
    ...(ipnUrl ? { vnp_IpnUrl: ipnUrl } : {}),
  };

  const sorted = sortObject(vnpParams);
  const signData = qs.stringify(sorted, { encode: false });

  const vnp_SecureHash = crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  const redirectUrl = `${vnpUrl}?${qs.stringify({ ...sorted, vnp_SecureHash }, { encode: false })}`;

  return { redirectUrl, signData, vnp_SecureHash, vnpParams: sorted };
}

export function verifyVnpReturn(query) {
  const copy = { ...query };
  const receivedHash = (copy.vnp_SecureHash || "").toLowerCase();
  delete copy.vnp_SecureHash;
  delete copy.vnp_SecureHashType;

  const sorted = sortObject(copy);
  const signData = qs.stringify(sorted, { encode: false });

  const calcHash = crypto
    .createHmac("sha512", String(process.env.VNP_HASH_SECRET || "").trim())
    .update(signData, "utf-8")
    .digest("hex")
    .toLowerCase();

  return {
    isValid: receivedHash === calcHash,
    params: sorted,
    received: receivedHash,
    calc: calcHash,
  };
}
