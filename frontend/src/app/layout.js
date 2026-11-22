import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "QuickCart · Quick Commerce",
  description: "Order and Delivery Tracking System",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <CartProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
