import "../globals.css";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import ClientProvider from "@/components/forms/ClientProvider";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <Navbar />
      {children}
      <Footer />
    </ClientProvider>
  );
}
