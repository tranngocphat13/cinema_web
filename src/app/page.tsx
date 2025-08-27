"use client";
import MainLayout from "@/components/forms/MainLayout";
import Footer from "@/components/ui/footer";
import Navbar from "@/components/ui/navbar";
import React from "react";


export default function Home() {
  return (
    <div>
      <Navbar />
      <MainLayout />
      <Footer />
    </div>
  );
}
