import type { Metadata } from "next";
import { SITE_URL, toAbsoluteUrl } from "@/lib/siteConfig";

const fleetImageUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&h=630&q=85";

export const metadata: Metadata = {
  title: "Browse Car Fleet in Addis Ababa | Verified P2P Rentals",
  description:
    "Explore peer-to-peer car rentals across Addis Ababa, Bole, Kazanchis, and Piassa. Filter by automatic or manual, seats, and daily rates with verified Ethiopian hosts.",
  alternates: {
    canonical: "/cars",
  },
  openGraph: {
    title: "Browse Addis Ababa Car Rental Fleet | Sheggar Wheels",
    description:
      "Explore 15+ verified peer-to-peer vehicles across Bole, Kazanchis, and Piassa. Transparent daily pricing with Telebirr & CBE Birr.",
    url: `${SITE_URL}/cars`,
    siteName: "Sheggar Wheels",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: fleetImageUrl,
        width: 1200,
        height: 630,
        alt: "Sheggar Wheels Addis Ababa Vehicle Fleet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Addis Ababa Car Rental Fleet | Sheggar Wheels",
    description:
      "Explore verified peer-to-peer vehicles across Bole, Kazanchis, and Piassa. Transparent daily pricing with Telebirr & CBE Birr.",
    images: [fleetImageUrl],
    creator: "@shegerwheels",
  },
};

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
