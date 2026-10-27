import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Cars Fleet | Rent Cars in Addis Ababa",
  description:
    "Explore peer-to-peer car rentals across Addis Ababa, Bole, Kazanchis, and Piassa. Filter by automatic or manual, seats, and daily rates with verified Ethiopian hosts.",
  alternates: {
    canonical: "/cars",
  },
  openGraph: {
    title: "Browse Cars Fleet | Sheggar Wheels Addis Ababa",
    description:
      "Explore peer-to-peer car rentals across Addis Ababa, Bole, Kazanchis, and Piassa. Filter by transmission, seats, and pricing.",
    url: "/cars",
    type: "website",
  },
};

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
