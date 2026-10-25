"use client";

import React, { useState } from "react";
import { Bell, AlertCircle, CheckCircle, Car, ShieldAlert, Sparkles, X } from "lucide-react";
import { useSession } from "@/lib/useStorage";
import { getBookings, getDisputes, getAnnouncements } from "@/lib/data";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  link?: string;
  time: string;
}

export function NotificationBell() {
  const { session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const notifications = React.useMemo<NotificationItem[]>(() => {
    if (!session) return [];
    const list: NotificationItem[] = [];

    // System Announcements
    const announcements = getAnnouncements(true);
    announcements.forEach((a) => {
      list.push({
        id: `anc_${a.id}`,
        title: a.title,
        message: a.message,
        type: "info",
        time: new Date(a.createdAt).toLocaleDateString(),
      });
    });

    // Renter Notifications
    if (session.user.roles.includes("renter")) {
      const renterBookings = getBookings({ renterId: session.user.id });
      renterBookings.slice(0, 3).forEach((b) => {
        if (b.status === "confirmed") {
          list.push({
            id: `notif_bkg_conf_${b.id}`,
            title: "Booking Confirmed",
            message: `Your reservation from ${b.startDate} to ${b.endDate} was approved by the host!`,
            type: "success",
            link: `/bookings/${b.id}`,
            time: new Date(b.updatedAt).toLocaleDateString(),
          });
        } else if (b.status === "requested") {
          list.push({
            id: `notif_bkg_req_${b.id}`,
            title: "Booking Request Pending",
            message: `Awaiting host confirmation for your ${b.days}-day rental.`,
            type: "warning",
            link: `/bookings/${b.id}`,
            time: new Date(b.createdAt).toLocaleDateString(),
          });
        }
      });
    }

    // Owner Notifications
    if (session.user.roles.includes("owner")) {
      const ownerBookings = getBookings({ ownerId: session.user.id });
      const pendingRequests = ownerBookings.filter((b) => b.status === "requested");
      if (pendingRequests.length > 0) {
        list.push({
          id: "notif_owner_pending",
          title: "Action Needed: Incoming Requests",
          message: `You have ${pendingRequests.length} booking request(s) awaiting your review.`,
          type: "alert",
          link: "/owner",
          time: "Just now",
        });
      }
    }

    // Admin Notifications
    if (session.user.roles.includes("admin")) {
      const openDisputes = getDisputes().filter((d) => d.status === "open");
      if (openDisputes.length > 0) {
        list.push({
          id: "notif_admin_disputes",
          title: "Disputes Requiring Attention",
          message: `There are ${openDisputes.length} unresolved disputes needing administrator intervention.`,
          type: "alert",
          link: "/admin/disputes",
          time: "Active",
        });
      }
    }

    return list;
  }, [session]);

  if (!session) return null;

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications derived from demo state"
        className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-slate-200 z-50 text-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 bg-navy-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm">Demo Activity Feed</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition"
              aria-label="Close notification panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No recent notifications for your account.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3.5 hover:bg-slate-50 transition flex gap-3 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {n.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                    {n.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    {n.type === "alert" && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                    {n.type === "info" && <Car className="w-4 h-4 text-sky-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 text-xs">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-block mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
                      >
                        View details &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2.5 bg-slate-50 text-[11px] text-slate-500 text-center border-t border-slate-100">
            Notifications are derived directly from demo state. No server push connection.
          </div>
        </div>
      )}
    </div>
  );
}
