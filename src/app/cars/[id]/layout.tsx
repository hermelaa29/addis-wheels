import type { Metadata } from "next";
import { findCarByIdOrSlug, getCarSlug } from "@/lib/slugs";

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

  return {
    title: `${car.year} ${car.make} ${car.model} Rental in ${car.neighbourhood}`,
    description: `Rent a ${car.year} ${car.make} ${car.model} in ${car.neighbourhood}, Addis Ababa for ${car.pricePerDay.toLocaleString()} ETB/day. ${car.transmission} transmission, ${car.seats} seats. Verified host, instant booking.`,
    alternates: {
      canonical: `/cars/${slug}`,
    },
    openGraph: {
      title: `${car.year} ${car.make} ${car.model} Rental | Sheggar Wheels Addis Ababa`,
      description: `Rent a ${car.year} ${car.make} ${car.model} in ${car.neighbourhood}, Addis Ababa for ${car.pricePerDay.toLocaleString()} ETB/day.`,
      url: `/cars/${slug}`,
      images: car.photos && car.photos.length > 0 ? [{ url: car.photos[0] }] : ["/og-image.png"],
    },
  };
}

export default function CarDetailLayout({ children }: Props) {
  return children;
}
