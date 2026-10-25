"use client";

import React, { useState, useMemo } from "react";
import { getAnnouncements, saveAnnouncement } from "@/lib/data";
import { useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Megaphone,
  Plus,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AdminAnnouncementsPage() {
  const isMounted = useIsMounted();
  const announcements = useMemo(() => (isMounted ? getAnnouncements() : []), [isMounted]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !message.trim()) {
      setError("Both title and message are required.");
      return;
    }

    const res = saveAnnouncement({
      id: editingId || undefined,
      title: title.trim(),
      message: message.trim(),
      active,
    });

    if (!res.success) {
      setError(res.error || "Failed to save announcement");
    } else {
      setSuccess(editingId ? "Announcement updated!" : "New announcement broadcast!");
      setTitle("");
      setMessage("");
      setEditingId(null);
    }
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    const a = announcements.find((item) => item.id === id);
    if (!a) return;
    saveAnnouncement({
      id: a.id,
      title: a.title,
      message: a.message,
      active: !currentActive,
    });
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Announcements" },
          ]}
        />

        <div className="mb-8">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
            Community Broadcasts
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            System Announcements Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Post platform news, seasonal safety advice, or promotions displayed to all Sheggar Wheels users.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create / Edit Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                <span>{editingId ? "Edit Announcement" : "Create Broadcast"}</span>
              </h2>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Holiday Weekend Booking Notice"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Message Body
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details of the announcement..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="activeToggle"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="activeToggle" className="font-semibold text-slate-700 cursor-pointer">
                    Active & visible to users
                  </label>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-sm transition"
                  >
                    {editingId ? "Update" : "Publish Announcement"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setTitle("");
                        setMessage("");
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List of Announcements */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500">
              Published Announcements ({announcements.length})
            </h2>

            {announcements.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
                No announcements created yet.
              </div>
            ) : (
              announcements.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            a.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {a.active ? "Active" : "Archived"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{a.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(a.id, a.active)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                          a.active
                            ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {a.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(a.id);
                          setTitle(a.title);
                          setMessage(a.message);
                          setActive(a.active);
                        }}
                        className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {a.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
