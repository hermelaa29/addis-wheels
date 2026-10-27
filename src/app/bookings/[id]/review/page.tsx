"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getBookingById,
  getBookingSlug,
  getCarById,
  getCarSlug,
  getReviews,
  createReview,
} from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Star, AlertCircle, CheckCircle2, Car, ArrowRight } from "lucide-react";

export default function BookingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const bookingId = params?.id as string;
  const booking = useMemo(() => (isMounted ? getBookingById(bookingId) : null), [isMounted, bookingId]);
  const car = useMemo(() => (booking ? getCarById(booking.carId) : null), [booking]);
  const existingReviews = useMemo(() => (isMounted ? getReviews() : []), [isMounted]);
  const currentReview = useMemo(
    () => existingReviews.find((r) => r.bookingId === bookingId),
    [existingReviews, bookingId]
  );

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isMounted) return null;

  if (!booking || !car) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Booking Not Found</h2>
        <Link href="/bookings" className="text-xs font-bold text-emerald-600 underline">
          Return to Bookings
        </Link>
      </div>
    );
  }

  // Security check: Only the renter of this booking can review
  if (session && booking.renterId !== session.user.id) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 rounded-3xl border border-rose-200 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900 mb-1">Unauthorized</h2>
        <p className="text-xs text-rose-700 mb-4">
          Only the renter who completed this reservation can submit a review.
        </p>
        <Link href="/dashboard" className="text-xs font-bold text-slate-800 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Eligibility check: status must be completed
  if (booking.status !== "completed") {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Trip Not Completed</h2>
        <p className="text-xs text-slate-500 mb-4">
          Reviews can only be submitted after a rental is marked completed by the host. Current status is &quot;{booking.status}&quot;.
        </p>
        <Link href={`/bookings/${getBookingSlug(booking, car)}`} className="text-xs font-bold text-emerald-600 underline">
          View Booking Details
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = createReview({
      bookingId: booking.id,
      rating,
      comment,
    });

    if (!res.success) {
      setError(res.error || "Failed to submit review");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push(`/cars/${getCarSlug(car)}`);
    }, 1200);
  };

  return (
    <RoleGuard requiredRole="renter">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/bookings" },
            { label: `Booking #${booking.id}`, href: `/bookings/${getBookingSlug(booking, car)}` },
            { label: "Rate & Review" },
          ]}
        />

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Verified Rental Feedback
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Rate your experience with {car.year} {car.make} {car.model}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Rental Period: {booking.startDate} to {booking.endDate} ({booking.days} days)
            </p>
          </div>

          {currentReview ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Review Already Submitted</h3>
              <div className="flex items-center justify-center gap-1 text-amber-500">
                {Array.from({ length: currentReview.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic max-w-md mx-auto">
                &ldquo;{currentReview.comment}&rdquo;
              </p>
              {currentReview.ownerReply && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-left">
                  <strong className="text-emerald-900 block mb-1">Host Response:</strong>
                  <p className="text-emerald-800">{currentReview.ownerReply}</p>
                </div>
              )}
              <div className="pt-2">
                <Link
                  href={`/cars/${getCarSlug(car)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                >
                  View on Car Page &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your review was recorded. Redirecting...</span>
                </div>
              )}

              {/* Star Rating Select */}
              <div className="text-center space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Star Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300 hover:text-amber-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 block">
                  {rating} of 5 Stars
                </span>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Detailed Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How was the vehicle condition, fuel efficiency, host punctuality, and pickup experience in Addis Ababa?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <span>Submit Verified Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
