// src/lib/vnpay.js
import crypto from "crypto";
import qs from "qs";

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * VNPAY nhận thời gian theo GMT+7 (VN) dạng yyyymmddHHMMss, KHÔNG kèm timezone.
 * Vercel chạy UTC => phải tự chuyển sang giờ VN.
 */
function vnTimestamp(ms = Date.now()) {
  // VN = UTC+7, Vietnam không có DST
  const d = new Date(ms + 7 * 60 * 60 * 1000);
  // dùng UTC-getters để tránh phụ thuộc server timezone
  return (
    `${d.getUTCFullYear()}` +
    `${pad(d.getUTCMonth() + 1)}` +
    `${pad(d.getUTCDate())}` +
    `${pad(d.getUTCHours())}` +
    `${pad(d.getUTCMinutes())}` +
    `${pad(d.getUTCSeconds())}`
  );
}

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj)
    .map((k) => encodeURIComponent(k))
    .sort();

  for (const k of keys) {
    const rawKey = decodeURIComponent(k);
    const val = obj[rawKey];
    // VNPAY sample: encodeURIComponent + spaces => '+'
    sorted[k] = encodeURIComponent(String(val)).replace(/%20/g, "+");
  }
  return sorted;
}

export function buildVnpayUrl({
  amount,
  orderId,
  orderInfo,
  ipAddr,
  bankCode,
  locale = "vn",
}) {
  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = String(process.env.VNP_HASH_SECRET || "").trim();
  const vnpUrl = process.env.VNP_PAYMENT_URL;
  const returnUrl = process.env.VNP_RETURN_URL;

  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
    throw new Error("Thiếu cấu hình VNPAY (TMN_CODE / HASH_SECRET / PAYMENT_URL / RETURN_URL)");
  }

  const numericAmount = Math.round(Number(amount));
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount không hợp lệ");
  }

  // ✅ giờ VN
  const createDate = vnTimestamp(Date.now());
  const expireDate = vnTimestamp(Date.now() + 15 * 60 * 1000);

  const safeInfo = (orderInfo || `Thanh toan ${orderId}`)
    .replace(/[^\w\s:,.()-]/g, " ")
    .trim();

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: numericAmount * 100, // VNPAY x100
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(orderId), // lưu ý <= 34 ký tự
    vnp_OrderInfo: safeInfo,
    vnp_OrderType: "other",
    vnp_Locale: locale,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
    ...(bankCode ? { vnp_BankCode: bankCode } : {}),
  };

  const sorted = sortObject(vnpParams);

  // signData là chuỗi query (đã encode theo chuẩn VNPAY)
  const signData = qs.stringify(sorted, { encode: false });

  const vnp_SecureHash = crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  // ✅ thêm vnp_SecureHashType khi redirect (không hash nó)
  const redirectUrl =
    `${vnpUrl}?` +
    qs.stringify(
      {
        ...sorted,
        vnp_SecureHashType: "HmacSHA512",
        vnp_SecureHash,
      },
      { encode: false }
    );

  return { redirectUrl, signData, vnp_SecureHash, vnpParams: sorted };
}

export function verifyVnpReturn(query) {
  const copy = { ...query };
  const receivedHash = String(copy.vnp_SecureHash || "").toLowerCase();
  delete copy.vnp_SecureHash;
  delete copy.vnp_SecureHashType;

  const sorted = sortObject(copy);
  const signData = qs.stringify(sorted, { encode: false });

  const calcHash = crypto
    .createHmac("sha512", String(process.env.VNP_HASH_SECRET || "").trim())
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex")
    .toLowerCase();

  return {
    isValid: receivedHash === calcHash,
    params: sorted,
    received: receivedHash,
    calc: calcHash,
    signBase: signData,
  };
}
