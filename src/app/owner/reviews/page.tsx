"use client";

import React, { useState, useMemo } from "react";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { getReviews, getCars, replyToReview, getCarById } from "@/lib/data";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Star, MessageSquare, Reply, CheckCircle2, Car } from "lucide-react";

export default function OwnerReviewsPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const ownerId = session?.user.id;
  const myCars = useMemo(() => {
    if (!isMounted || !ownerId) return [];
    return getCars({ status: "all" }).filter((c) => c.ownerId === ownerId);
  }, [isMounted, ownerId]);

  const carIds = useMemo(() => myCars.map((c) => c.id), [myCars]);

  const allReviews = useMemo(() => {
    if (!isMounted || carIds.length === 0) return [];
    return getReviews().filter((r) => carIds.includes(r.carId));
  }, [isMounted, carIds]);

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    const res = replyToReview(reviewId, replyText);
    if (!res.success) {
      alert(res.error);
    } else {
      setActiveReplyId(null);
      setReplyText("");
    }
  };

  return (
    <RoleGuard requiredRole="owner">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Host Hub", href: "/owner" },
            { label: "Guest Reviews" },
          ]}
        />

        <div className="mb-6">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Reputation Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Reviews on Your Fleet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Read renter feedback on your vehicles and submit official host responses.
          </p>
        </div>

        {allReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Reviews Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once renters complete their trips, their star ratings and feedback will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allReviews.map((rev) => {
              const car = getCarById(rev.carId);
              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {car ? `${car.year} ${car.make} ${car.model}` : "Vehicle"}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 self-start sm:self-auto">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {rev.rating}/5
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Owner reply if present */}
                  {rev.ownerReply && (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-left">
                      <strong className="text-emerald-900 block mb-1">Your Response:</strong>
                      <p className="text-emerald-800 leading-relaxed">{rev.ownerReply}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {!rev.ownerReply && (
                    <div>
                      {activeReplyId === rev.id ? (
                        <div className="space-y-2 pt-2">
                          <textarea
                            rows={3}
                            placeholder="Type your polite response to this review..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSendReply(rev.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Publish Response
                            </button>
                            <button
                              onClick={() => {
                                setActiveReplyId(null);
                                setReplyText("");
                              }}
                              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveReplyId(rev.id);
                            setReplyText("");
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline pt-1"
                        >
                          <Reply className="w-3.5 h-3.5" /> Reply to this review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
