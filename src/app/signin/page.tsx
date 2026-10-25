"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInAsDemo, safeReturnPath } from "@/lib/data";
import { useSession } from "@/lib/useStorage";
import {
  Car,
  Key,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  ArrowRight,
  User,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawReturnUrl = searchParams.get("returnUrl");
  const returnUrl = safeReturnPath(rawReturnUrl, "/dashboard");

  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("usr_renter_1");

  const demoAccounts = [
    {
      id: "usr_renter_1",
      name: "Abebe Kebede",
      email: "renter@shegerwheels.com",
      role: "renter" as const,
      description: "Standard Renter with active and past trip histories",
      icon: User,
      badgeColor: "bg-sky-100 text-sky-800",
    },
    {
      id: "usr_owner_1",
      name: "Dawit Haile",
      email: "owner@shegerwheels.com",
      role: "owner" as const,
      description: "Vehicle Host with 4 listed cars, earnings & incoming booking requests",
      icon: Briefcase,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "usr_admin_1",
      name: "Almaz Worku",
      email: "admin@shegerwheels.com",
      role: "admin" as const,
      description: "Platform Administrator with full moderation, dispute, & metric authority",
      icon: ShieldCheck,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "usr_suspended_1",
      name: "Yohannes Berhanu",
      email: "suspended@shegerwheels.com",
      role: "renter" as const,
      description: "Suspended Test Account (used to verify permission denial rules)",
      icon: ShieldAlert,
      badgeColor: "bg-rose-100 text-rose-800",
    },
  ];

  const handleSignIn = (userId: string, role?: "renter" | "owner" | "admin") => {
    setError("");
    const result = signInAsDemo(userId, role);
    if (!result.success) {
      setError(result.error || "Failed to sign in");
      return;
    }

    if (rawReturnUrl) {
      router.push(returnUrl);
    } else {
      if (role === "admin") router.push("/admin");
      else if (role === "owner") router.push("/owner");
      else router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full space-y-7 bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-emerald-600/20">
            <Key className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Demo Portal Sign In
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Select a pre-configured persona below to test role-specific workflows in Addis Ababa.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Persona Cards */}
        <div className="space-y-2.5" role="radiogroup" aria-label="Select demo account persona">
          <span className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
            Choose Persona
          </span>
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = selectedAccount === acc.id;
            return (
              <div
                key={acc.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedAccount(acc.id);
                  }
                }}
                onClick={() => setSelectedAccount(acc.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-slate-900">{acc.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">{acc.email}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{acc.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Action */}
        <button
          onClick={() => {
            const acc = demoAccounts.find((a) => a.id === selectedAccount);
            if (acc) handleSignIn(acc.id, acc.role);
          }}
          aria-label="Sign In as Selected Persona"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2"
        >
          <span>Sign In as Selected Persona</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Disclaimer */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs text-slate-500">
            Want to register a fresh guest account?{" "}
            <Link href="/signup" className="text-emerald-600 font-bold hover:underline">
              Create Renter Account
            </Link>
          </p>
          <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed text-left">
            <strong>Security Notice:</strong> Sheggar Wheels is a client-side prototype. Authentication is simulated without transmitting credentials to an external server.
          </div>
        </div>
      </div>
    </div>
  );
}
