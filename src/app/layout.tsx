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

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://addis-wheels.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    "Suzuki Swift Rental Addis Ababa",
  ],
  authors: [{ name: "Sheggar Wheels" }],
  creator: "Sheggar Wheels",
  publisher: "Sheggar Wheels",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Sheggar Wheels — Peer-to-Peer Car Rental in Addis Ababa",
    description:
      "Addis Ababa's curated mobility architecture. Rent verified cars peer-to-peer across Bole, Kazanchis, and Piassa with Telebirr & CBE Birr.",
    url: "/",
    siteName: "Sheggar Wheels",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sheggar Wheels — Luxury Mobility Architecture Addis Ababa",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sheggar Wheels — Peer-to-Peer Car Rental in Addis Ababa",
    description:
      "Addis Ababa's curated mobility architecture. Rent verified cars peer-to-peer across Bole, Kazanchis, and Piassa.",
    images: ["/og-image.png"],
    creator: "@shegerwheels",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
