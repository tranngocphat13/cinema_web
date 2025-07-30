import MainLayout from "@/components/forms/MainLayout";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
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