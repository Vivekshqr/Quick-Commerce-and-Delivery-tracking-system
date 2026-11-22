import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Toaster from "@/components/Toaster";
import { themeInitScript } from "@/lib/theme";

export const metadata = {
  title: "QuickCart · Groceries in minutes",
  description: "Quick commerce ordering with live delivery tracking",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1019" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-page text-slate-900 antialiased">
        <NotificationProvider>
          <CartProvider>
            <Navbar />
            <Toaster />
            <main className="mx-auto w-full max-w-6xl flex-1 animate-fade-up px-4 py-6 sm:px-6 sm:py-8">{children}</main>
            <Footer />
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
