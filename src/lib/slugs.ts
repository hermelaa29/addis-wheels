import { Car, Booking } from "@/types";
import { SEED_CARS, SEED_BOOKINGS } from "./seedData";

export function getCarSlug(car: { make: string; model: string; year?: number; id?: string }): string {
  const base = `${car.make}-${car.model}${car.year ? `-${car.year}` : ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base;
}

export function findCarByIdOrSlug(idOrSlug: string, cars: Car[] = SEED_CARS): Car | null {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).trim().toLowerCase();

  // 1. Direct ID match
  const byId = cars.find((c) => c.id.toLowerCase() === decoded);
  if (byId) return byId;

  // 2. Exact slug match (e.g. toyota-rav4-hybrid-2022)
  const bySlug = cars.find((c) => getCarSlug(c) === decoded);
  if (bySlug) return bySlug;

  // 3. Partial / name match
  const byName = cars.find((c) => {
    const withoutYear = `${c.make}-${c.model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return getCarSlug(c).startsWith(decoded) || decoded.startsWith(withoutYear) || decoded.includes(c.id.toLowerCase());
  });
  if (byName) return byName;

  // 4. Fallback search against SEED_CARS if custom list was passed
  if (cars !== SEED_CARS) {
    return findCarByIdOrSlug(idOrSlug, SEED_CARS);
  }

  return null;
}

export function getBookingSlug(booking: Booking, car?: Car | null): string {
  const associatedCar = car || SEED_CARS.find((c) => c.id === booking.carId);
  const carName = associatedCar ? getCarSlug(associatedCar) : "vehicle-trip";
  return `${carName}-trip-${booking.id}`;
}

export function findBookingByIdOrSlug(idOrSlug: string, bookings: Booking[] = SEED_BOOKINGS): Booking | null {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).trim().toLowerCase();

  // 1. Direct ID match
  const byId = bookings.find((b) => b.id.toLowerCase() === decoded);
  if (byId) return byId;

  // 2. Extracted ID match (e.g. toyota-rav4-hybrid-2022-trip-bkg_1 -> bkg_1)
  const byExtractedId = bookings.find((b) => {
    const idLower = b.id.toLowerCase();
    return decoded.endsWith(idLower) || decoded.includes(idLower);
  });
  if (byExtractedId) return byExtractedId;

  // 3. Fallback search against SEED_BOOKINGS if custom list was passed
  if (bookings !== SEED_BOOKINGS) {
    return findBookingByIdOrSlug(idOrSlug, SEED_BOOKINGS);
  }

  return null;
}
