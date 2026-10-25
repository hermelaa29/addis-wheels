"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDisputes,
  getBookingById,
  getUserById,
  getCarById,
  resolveDispute,
} from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  AlertTriangle,
  CheckCircle2,
  Car,
  User,
  ShieldCheck,
  Calendar,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { session } = useSession();

  const disputeId = params?.id as string;
  const disputes = useMemo(() => (isMounted ? getDisputes() : []), [isMounted]);
  const dispute = useMemo(() => disputes.find((d) => d.id === disputeId), [disputes, disputeId]);

  const booking = useMemo(
    () => (dispute ? getBookingById(dispute.bookingId) : null),
    [dispute]
  );
  const car = useMemo(() => (booking ? getCarById(booking.carId) : null), [booking]);
  const opener = useMemo(() => (dispute ? getUserById(dispute.openedBy) : null), [dispute]);
  const resolver = useMemo(
    () => (dispute?.resolvedBy ? getUserById(dispute.resolvedBy) : null),
    [dispute]
  );

  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isMounted) return null;

  if (!dispute) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
        <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Dispute Not Found</h2>
        <Link href="/admin/disputes" className="text-xs font-bold text-emerald-600 underline">
          Return to Dispute Tribunal
        </Link>
      </div>
    );
  }

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!notes.trim()) {
      setError("Please provide official administrator resolution findings and terms.");
      return;
    }

    setSubmitting(true);
    const res = resolveDispute(dispute.id, notes);
    if (!res.success) {
      setError(res.error || "Failed to resolve dispute");
      setSubmitting(false);
      return;
    }

    alert("Dispute officially resolved and archived with administrative seal.");
    router.push("/admin/disputes");
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Disputes", href: "/admin/disputes" },
            { label: `Claim #${dispute.id}` },
          ]}
        />

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
                  Dispute Adjudication
                </span>
                <Badge status={dispute.status} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Claim Ref: {dispute.id}
              </h1>
            </div>
            <span className="text-xs text-slate-400">
              Filed: {new Date(dispute.createdAt).toLocaleString()}
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dispute Reason & Statement */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Claim Reason & Statement
            </span>
            <h3 className="text-sm font-bold text-slate-900">{dispute.reason}</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {dispute.description}
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              Opened by: <strong className="text-slate-700">{opener?.name || dispute.openedBy}</strong> ({opener?.email})
            </div>
          </div>

          {/* Booking & Vehicle Context */}
          {booking && car && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-semibold text-slate-800">
                <span>Associated Rental Trip</span>
                <Link
                  href={`/bookings/${booking.id}`}
                  className="text-emerald-600 hover:underline"
                >
                  Inspect Full Receipt &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Vehicle</span>
                  <strong>{car.year} {car.make} {car.model}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dates</span>
                  <strong>{booking.startDate} to {booking.endDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Fare</span>
                  <strong className="text-emerald-700">{booking.total.toLocaleString()} ETB</strong>
                </div>
              </div>
            </div>
          )}

          {/* Already Resolved View */}
          {dispute.status === "resolved" ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Officially Resolved by Platform Administrator</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed pt-1">
                <strong>Resolution Findings:</strong> {dispute.resolutionNotes}
              </p>
              <div className="text-[11px] text-emerald-700 pt-2 border-t border-emerald-200 flex justify-between">
                <span>Resolved by Admin: {resolver?.name || dispute.resolvedBy}</span>
                <span>
                  Timestamp: {dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleString() : "N/A"}
                </span>
              </div>
            </div>
          ) : (
            /* Resolution Form */
            <form onSubmit={handleResolve} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Administrator Resolution Finding & Settlement Notes
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Record binding findings: e.g. 'Partial 50% refund authorized to renter due to verified A/C failure. Host cautioned regarding pre-rental inspections.'"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-800">
                Resolution is permanent and will be logged under your administrator identity (
                <strong>{session?.user.name}</strong>).
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <span>Issue Binding Administrator Resolution</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
