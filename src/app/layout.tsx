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
  authors: [{ name: "Sheggar Wheels", url: siteUrl }],
  creator: "Sheggar Wheels",
  publisher: "Sheggar Wheels",
  applicationName: "Sheggar Wheels",
  alternates: {
    canonical: "/",
  },
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
    url: siteUrl,
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
  category: "Car Rental",
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Sheggar Wheels",
      "description": "Discover, rent, or list cars peer-to-peer in Addis Ababa, Ethiopia.",
      "inLanguage": "en",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/cars?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "AutoRental",
      "@id": `${siteUrl}/#organization`,
      "name": "Sheggar Wheels",
      "url": siteUrl,
      "logo": `${siteUrl}/og-image.png`,
      "image": `${siteUrl}/og-image.png`,
      "description":
        "Addis Ababa's premier peer-to-peer vehicle sharing community. Rent verified cars from trusted local hosts across Bole, Kazanchis, Piassa, and beyond.",
      "telephone": "+251911000000",
      "priceRange": "ETB 1500 - 8000",
      "currenciesAccepted": "ETB",
      "paymentAccepted": "Telebirr, CBE Birr, Cash",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Bole Subcity",
        "addressLocality": "Addis Ababa",
        "addressRegion": "Addis Ababa",
        "addressCountry": "ET",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 9.0227,
        "longitude": 38.7468,
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        "opens": "00:00",
        "closes": "23:59",
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSchema),
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
