import { Suspense } from "react";
import BookingFlow from "@/components/forms/BookingFlow";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Đang tải dữ liệu...</div>}>
      <BookingFlow />
    </Suspense>
  );
}
