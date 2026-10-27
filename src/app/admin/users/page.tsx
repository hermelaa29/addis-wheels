"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getUsers, updateUserStatus } from "@/lib/data";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { RoleGuard } from "@/components/RoleGuard";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle2, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminUsersPage() {
  const isMounted = useIsMounted();
  const { session } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const allUsers = useMemo(() => {
    if (!isMounted) return [];
    return getUsers();
  }, [isMounted]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (roleFilter !== "all" && !u.roles.includes(roleFilter as any)) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        if (
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !u.phone.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allUsers, roleFilter, searchTerm]);

  const handleToggleStatus = (userId: string, currentStatus: "active" | "suspended") => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    const confirmMsg =
      nextStatus === "suspended"
        ? "Are you sure you want to suspend this user? They will not be able to book or list vehicles."
        : "Reinstate this account to active status?";
    if (confirm(confirmMsg)) {
      const res = updateUserStatus(userId, nextStatus);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "User Management" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              User Directory & Account Controls
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit user privileges, verify active phone numbers, and manage suspension states.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500">Role:</span>
            <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val)}>
              <SelectTrigger className="h-9 w-full sm:w-48 bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles ({allUsers.length})</SelectItem>
                <SelectItem value="renter">Renters</SelectItem>
                <SelectItem value="owner">Car Hosts</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">User Name & ID</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Assigned Roles</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-bold text-slate-900 hover:text-emerald-600 transition block"
                      >
                        {u.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-800 font-medium block">{u.email}</span>
                      <span className="text-[11px] text-slate-500">{u.phone}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge status={u.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        Inspect
                      </Link>

                      {session?.user.id !== u.id && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`text-xs font-semibold underline ${
                            u.status === "active" ? "text-rose-600 hover:text-rose-700" : "text-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          {u.status === "active" ? "Suspend" : "Reinstate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
