import type { Metadata } from "next";
import { findBookingByIdOrSlug, findCarByIdOrSlug, getBookingSlug, getCarSlug } from "@/lib/slugs";
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
  const booking = findBookingByIdOrSlug(resolvedParams.id);
  const car = booking ? findCarByIdOrSlug(booking.carId) : null;

  if (!booking || !car) {
    return {
      title: "Trip Booking Details | Sheggar Wheels",
      description: "Manage and review your peer-to-peer car rental on Sheggar Wheels Addis Ababa.",
      alternates: {
        canonical: `/bookings/${resolvedParams.id}`,
      },
    };
  }

  const bookingSlug = getBookingSlug(booking, car);
  const carTitle = `${car.year} ${car.make} ${car.model}`;
  const title = `Trip Booking: ${carTitle} (${booking.startDate} – ${booking.endDate})`;
  const description = `Confirmed rental for ${carTitle} in ${car.neighbourhood}, Addis Ababa. Total: ${booking.total.toLocaleString()} ETB. Verified on Sheggar Wheels.`;
  const photoUrl = car.photos && car.photos.length > 0 ? toAbsoluteUrl(car.photos[0]) : `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `/bookings/${bookingSlug}`,
    },
    openGraph: {
      title: `${title} | Sheggar Wheels`,
      description,
      url: `${SITE_URL}/bookings/${bookingSlug}`,
      siteName: "Sheggar Wheels",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: photoUrl,
          width: 1200,
          height: 800,
          alt: `${carTitle} rental in Addis Ababa`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [photoUrl],
      creator: "@shegerwheels",
    },
  };
}

export default function BookingDetailLayout({ children }: Props) {
  return children;
}
