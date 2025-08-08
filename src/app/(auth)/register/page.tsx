import RegisterForm from "@/components/forms/RegisterForm";
import React from "react";

export default function page() {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-white">
      <RegisterForm />
    </div>
  );
}
