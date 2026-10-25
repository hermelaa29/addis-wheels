"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCarById, createBooking } from "@/lib/data";
import { getCheckoutDraft, clearCheckoutDraft } from "@/lib/storage";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  CreditCard,
  Calendar,
  MapPin,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Car,
  Smartphone,
  Building,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const [draft, setDraft] = useState(getCheckoutDraft());
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbe" | "card">("telebirr");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isMounted) {
      setDraft(getCheckoutDraft());
    }
  }, [isMounted]);

  const car = isMounted && draft ? getCarById(draft.carId) : null;

  const handleSimulatePayment = () => {
    if (!draft || !car || !session) return;
    setIsSubmitting(true);
    setError("");

    try {
      const result = createBooking({
        carId: draft.carId,
        startDate: draft.startDate,
        endDate: draft.endDate,
      });

      if (!result.success || !result.booking) {
        setError(result.error || "Failed to finalize booking request");
        setIsSubmitting(false);
        return;
      }

      clearCheckoutDraft();
      router.push(`/bookings/${result.booking.id}`);
    } catch {
      setError("An unexpected storage error occurred during payment simulation.");
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard requiredRole="renter">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Fleet", href: "/cars" },
            { label: "Checkout & Booking" },
          ]}
        />

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Simulated Checkout
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Confirm Your Reservation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review vehicle specifications, rental duration, and simulated payment method.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!draft || !car ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Active Checkout Draft</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              You haven&apos;t selected rental dates for a vehicle yet. Please pick a car from the catalogue to begin.
            </p>
            <Link
              href="/cars"
              className="inline-flex items-center px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl text-xs"
            >
              Browse Available Cars
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left 2 cols: Car summary & Payment Method */}
            <div className="md:col-span-2 space-y-6">
              {/* Vehicle Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-full sm:w-44 aspect-[16/10] bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                  {car.photos && car.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={car.photos[0]}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                    {car.year} • {car.transmission}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5 truncate">
                    {car.make} {car.model}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{car.neighbourhood}, Addis Ababa</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Pickup Date</span>
                      <strong className="text-slate-900">{draft.startDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Return Date</span>
                      <strong className="text-slate-900">{draft.endDate}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Payment Methods */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Select Simulated Payment Method
                </h3>
                <p className="text-xs text-slate-500">
                  Select a local Ethiopian payment method to simulate the transaction. No real funds are debited.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Telebirr */}
                  <div
                    onClick={() => setPaymentMethod("telebirr")}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left ${
                      paymentMethod === "telebirr"
                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-sky-600 mb-2" />
                    <span className="font-extrabold text-xs text-slate-900 block">telebirr</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Ethio Telecom Wallet</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-2 block">Instant Simulation</span>
                  </div>

                  {/* CBE Birr */}
                  <div
                    onClick={() => setPaymentMethod("cbe")}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left ${
                      paymentMethod === "cbe"
                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50"
                    }`}
                  >
                    <Building className="w-5 h-5 text-purple-600 mb-2" />
                    <span className="font-extrabold text-xs text-slate-900 block">CBE Birr</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Commercial Bank</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-2 block">Instant Simulation</span>
                  </div>

                  {/* Mock Card */}
                  <div
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left ${
                      paymentMethod === "card"
                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-slate-600 mb-2" />
                    <span className="font-extrabold text-xs text-slate-900 block">Bank Card</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Visa / Mastercard</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-2 block">Test Token</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Simulated Sandbox: A fictional transaction reference (`SW-TXN-...`) will be assigned immediately.
                  </span>
                </div>
              </div>
            </div>

            {/* Right 1 col: Price summary & Action */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Fare Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {draft.pricePerDay.toLocaleString()} ETB × {draft.days}{" "}
                      {draft.days === 1 ? "day" : "days"}
                    </span>
                    <span className="font-bold text-slate-900">
                      {draft.subtotal.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Platform Fee (10%)</span>
                    <span className="font-bold text-slate-900">
                      {draft.fee.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-base text-slate-900">
                    <span>Total Due</span>
                    <span className="text-emerald-600">
                      {draft.total.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSimulatePayment}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Processing Demo Payment...</span>
                    ) : (
                      <>
                        <span>Simulate & Confirm Booking</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  By clicking, your booking will be submitted to the host for approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
