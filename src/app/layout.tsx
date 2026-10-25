import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DemoBanner } from "@/components/DemoBanner";
import { ToastContainer } from "@/components/ToastContainer";
import { GSAPScrollProvider } from "@/components/GSAPScrollProvider";

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Sheggar Wheels — Peer-to-Peer Car Rental in Addis Ababa",
    template: "%s | Sheggar Wheels",
  },
  description:
    "Discover, rent, or list cars peer-to-peer in Addis Ababa, Ethiopia. Verified hosts, affordable daily rates, transparent bookings across Bole, Kazanchis, Piassa, and beyond.",
  keywords: [
    "Car Rental Addis Ababa",
    "Sheggar Wheels",
    "Ethiopia Car Sharing",
    "Rent Car Bole",
    "P2P Car Rental Ethiopia",
  ],
  openGraph: {
    title: "Sheggar Wheels — Peer-to-Peer Car Rental in Addis Ababa",
    description:
      "Peer-to-peer vehicle rental marketplace for Addis Ababa. Rent directly from trusted local hosts.",
    siteName: "Sheggar Wheels",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sw_theme_mode_v1');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200">
        <DemoBanner />
        <Navbar />
        <main className="flex-1 flex flex-col">
          <GSAPScrollProvider>{children}</GSAPScrollProvider>
        </main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
