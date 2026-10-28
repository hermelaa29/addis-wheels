import type { Metadata } from "next";
import { findCarByIdOrSlug, getCarSlug } from "@/lib/slugs";
import { SITE_URL, toAbsoluteUrl } from "@/lib/siteConfig";

type Props = {
  params: Promise<{ id: string }> | { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const car = findCarByIdOrSlug(resolvedParams.id);

  if (!car) {
    return {
      title: "Vehicle Details | Sheggar Wheels",
      description: "Rent verified cars peer-to-peer in Addis Ababa with Sheggar Wheels.",
      alternates: {
        canonical: `/cars/${resolvedParams.id}`,
      },
    };
  }

  const slug = getCarSlug(car);
  const pageUrl = `${SITE_URL}/cars/${slug}`;
  const carTitle = `${car.year} ${car.make} ${car.model} Rental in ${car.neighbourhood}`;
  const carDesc = `Rent a ${car.year} ${car.make} ${car.model} in ${car.neighbourhood}, Addis Ababa for ${car.pricePerDay.toLocaleString()} ETB/day. ${car.transmission.toUpperCase()} transmission, ${car.seats} seats. Verified host, instant booking on Sheggar Wheels.`;

  const ogImages =
    car.photos && car.photos.length > 0
      ? car.photos.map((p, idx) => ({
          url: toAbsoluteUrl(p),
          width: 1200,
          height: 800,
          alt: `${car.year} ${car.make} ${car.model} in Addis Ababa - Photo ${idx + 1}`,
        }))
      : [
          {
            url: `${SITE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: carTitle,
          },
        ];

  const primaryPhoto = ogImages[0]?.url || `${SITE_URL}/og-image.png`;

  return {
    title: carTitle,
    description: carDesc,
    alternates: {
      canonical: `/cars/${slug}`,
    },
    openGraph: {
      title: `${carTitle} | Sheggar Wheels Addis Ababa`,
      description: carDesc,
      url: pageUrl,
      siteName: "Sheggar Wheels",
      locale: "en_US",
      type: "article",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${carTitle} · ${car.pricePerDay.toLocaleString()} ETB/day`,
      description: `${car.transmission.toUpperCase()} · ${car.seats} Seats · ${car.neighbourhood}, Addis Ababa. Verified host, instant booking.`,
      images: [primaryPhoto],
      creator: "@shegerwheels",
    },
  };
}

export default function CarDetailLayout({ children }: Props) {
  return children;
}
