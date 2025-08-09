"use client";
import MainLayout from "@/components/forms/MainLayout";
import React from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <MainLayout />
      <Footer />
    </div>
  );
}
