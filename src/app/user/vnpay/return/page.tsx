import { Suspense } from "react";
import VnpayReturnPage from "./VnpayReturn";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-white">Đang tải kết quả thanh toán...</div>}>
      <VnpayReturnPage />
    </Suspense>
  );
}
