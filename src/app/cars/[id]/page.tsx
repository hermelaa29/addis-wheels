"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCarById,
  getCars,
  getUserById,
  getReviews,
  calculateDays,
  isDateRangeAvailable,
} from "@/lib/data";
import { saveCheckoutDraft } from "@/lib/storage";
import { useIsMounted, useSession } from "@/lib/useStorage";
import { BookingDatesSchema } from "@/lib/validations";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LeafletMap } from "@/components/LeafletMap";
import { Badge } from "@/components/Badge";
import { CarCard } from "@/components/CarCard";
import {
  Users,
  Fuel,
  Calendar,
  MapPin,
  ShieldCheck,
  Star,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Car as CarIcon,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const carId = params?.id as string;
  const car = useMemo(() => (isMounted ? getCarById(carId) : null), [isMounted, carId]);
  const host = useMemo(() => (car ? getUserById(car.ownerId) : null), [car]);
  const reviews = useMemo(() => (car ? getReviews(car.id) : []), [car]);

  // Date selection state
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Related cars
  const relatedCars = useMemo(() => {
    if (!car) return [];
    return getCars({ status: "approved" })
      .filter((c) => c.id !== car.id && (c.neighbourhood === car.neighbourhood || c.make === car.make))
      .slice(0, 3);
  }, [car]);

  // Pricing calculations
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calculateDays(startDate, endDate);
  }, [startDate, endDate]);

  const pricing = useMemo(() => {
    if (!car || rentalDays <= 0) return null;
    const subtotal = car.pricePerDay * rentalDays;
    const fee = Math.round(subtotal * 0.1); // 10% platform fee
    const total = subtotal + fee;
    return { subtotal, fee, total };
  }, [car, rentalDays]);

  // Availability validation
  const availabilityCheck = useMemo(() => {
    if (!car || !startDate || !endDate) return { available: true };
    if (rentalDays <= 0) {
      return { available: false, error: "End date must be at least 1 day after start date." };
    }
    const isAvail = isDateRangeAvailable(car.id, startDate, endDate);
    if (!isAvail) {
      return {
        available: false,
        error: "Vehicle is not available for these selected dates (already booked or host blocked).",
      };
    }
    return { available: true };
  }, [car, startDate, endDate, rentalDays]);

  const handleProceedToCheckout = () => {
    setBookingError("");
    
    // Zod Date Range Validation
    const dateValidation = BookingDatesSchema.safeParse({ startDate, endDate });
    if (!dateValidation.success) {
      setBookingError(dateValidation.error.errors[0]?.message || "Invalid rental dates");
      return;
    }

    if (rentalDays <= 0) {
      setBookingError("End date must be after start date.");
      return;
    }
    if (!availabilityCheck.available) {
      setBookingError(availabilityCheck.error || "Dates are unavailable.");
      return;
    }
    if (!pricing || !car) return;

    // Check if user is owner of this car
    if (session && session.user.id === car.ownerId) {
      setBookingError("You cannot rent a vehicle that you own.");
      return;
    }

    // Save temporary checkout draft into sessionStorage
    saveCheckoutDraft({
      carId: car.id,
      startDate,
      endDate,
      days: rentalDays,
      pricePerDay: car.pricePerDay,
      subtotal: pricing.subtotal,
      fee: pricing.fee,
      total: pricing.total,
      createdAt: new Date().toISOString(),
    });

    // If not signed in, prompt sign in with safe return
    if (!session) {
      router.push(`/signin?returnUrl=${encodeURIComponent("/checkout")}`);
    } else {
      router.push("/checkout");
    }
  };

  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-semibold">Loading vehicle details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg">
        <CarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Car Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The requested vehicle listing does not exist or has been removed.
        </p>
        <Link
          href="/cars"
          className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          &larr; Back to Fleet
        </Link>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* JSON-LD Structured Data for AutoRental SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoRental",
            name: `${car.year} ${car.make} ${car.model}`,
            image: car.photos,
            description: car.description,
            address: {
              "@type": "PostalAddress",
              addressLocality: car.neighbourhood,
              addressRegion: "Addis Ababa",
              addressCountry: "ET",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: car.latitude,
              longitude: car.longitude,
            },
            offers: {
              "@type": "Offer",
              price: car.pricePerDay,
              priceCurrency: "ETB",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Fleet", href: "/cars" },
          { label: `${car.make} ${car.model}` },
        ]}
      />

      {/* Main Grid: Showcase & Details vs Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Images, Specs, Description, Map, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photos Showcase */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              {car.photos && car.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={car.photos[0]}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No preview photo available
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge status={car.status} size="md" />
                <span className="bg-navy-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase border border-white/10">
                  {car.transmission}
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {car.photos && car.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {car.photos.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title & Host Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  {car.year} Model • {car.neighbourhood}, Addis Ababa
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tracking-tight">
                  {car.make} {car.model}
                </h1>
              </div>

              {averageRating && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl self-start">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black text-amber-900">{averageRating}</span>
                  <span className="text-xs text-amber-700">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            {/* Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-slate-100 my-4 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity</span>
                  <span className="font-extrabold text-slate-900">{car.seats} Passengers</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Gearbox</span>
                  <span className="font-extrabold text-slate-900 capitalize">{car.transmission}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Hub</span>
                  <span className="font-extrabold text-slate-900">{car.neighbourhood}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Host</span>
                  <span className="font-extrabold text-slate-900">{host?.name || "Verified Host"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">About this vehicle</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {car.description}
              </p>
            </div>
          </div>

          {/* Pickup Location Map */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Pickup Location in Addis Ababa
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Approximate handover location in {car.neighbourhood}. Exact landmark shared upon host confirmation.
            </p>
            <LeafletMap
              center={[car.latitude, car.longitude]}
              zoom={14}
              markers={[
                {
                  id: car.id,
                  lat: car.latitude,
                  lng: car.longitude,
                  title: `${car.make} ${car.model}`,
                  subtitle: `${car.neighbourhood}, Addis Ababa`,
                  price: car.pricePerDay,
                },
              ]}
              height="320px"
              fallbackAddress={`${car.neighbourhood}, Addis Ababa, Ethiopia`}
            />
          </div>

          {/* Verified Customer Reviews */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Renter Feedback</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">
                No reviews yet for this vehicle. Be the first to rent and leave feedback!
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                          R
                        </div>
                        <span className="text-xs font-bold text-slate-900">Verified Renter</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>

                    {/* Owner reply */}
                    {rev.ownerReply && (
                      <div className="mt-3 ml-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs">
                        <span className="font-bold text-emerald-900 block mb-0.5">
                          Host Response:
                        </span>
                        <p className="text-emerald-800 leading-relaxed">{rev.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl space-y-6">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {car.pricePerDay.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-600 ml-1">ETB / day</span>
              </div>
              <Badge status={car.status} />
            </div>

            {/* Date Pickers */}
            <div className="space-y-4">
              <div>
                <label htmlFor="booking-start-date" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Start Date
                </label>
                <input
                  id="booking-start-date"
                  name="bookingStartDate"
                  type="date"
                  value={startDate}
                  min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="booking-end-date" className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Return Date
                </label>
                <input
                  id="booking-end-date"
                  name="bookingEndDate"
                  type="date"
                  value={endDate}
                  min={startDate || todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Pricing Breakdown */}
            {pricing && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>
                    {car.pricePerDay.toLocaleString()} ETB × {rentalDays}{" "}
                    {rentalDays === 1 ? "day" : "days"}
                  </span>
                  <span className="font-bold text-slate-900">
                    {pricing.subtotal.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Platform Fee (10%)</span>
                  <span className="font-bold text-slate-900">
                    {pricing.fee.toLocaleString()} ETB
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-emerald-600 font-extrabold">{pricing.total.toLocaleString()} ETB</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {(!availabilityCheck.available || bookingError) && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bookingError || availabilityCheck.error}</span>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={!availabilityCheck.available || car.status !== "approved"}
              aria-label="Proceed to booking checkout"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-600 text-center space-y-1">
              <p>Simulated demo checkout. No real money charged.</p>
              <p>Free cancellation while request is pending host approval.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Cars Section */}
      {relatedCars.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Similar Vehicles You Might Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedCars.map((rc) => (
              <CarCard key={rc.id} car={rc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
