"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Button({
  children,
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "destructive" }) {
  const base =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
