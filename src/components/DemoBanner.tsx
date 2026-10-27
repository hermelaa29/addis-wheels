"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, X, ShieldCheck } from "lucide-react";
import { resetDemoData } from "@/lib/storage";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (dismissed) return null;

  const handleReset = () => {
    if (confirm("Reset all Sheggar Wheels data back to original Addis Ababa fictional seed state?")) {
      setIsResetting(true);
      resetDemoData();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-slate-300 text-xs py-2 px-4 border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] uppercase tracking-wider shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Prototype Mode
          </span>
          <span className="text-[11px] text-slate-300 truncate">
            <strong>Sheggar Wheels:</strong> P2P Car Rental Prototype for Addis Ababa. Local browser storage active.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            disabled={isResetting}
            aria-label="Reset demo data to default baseline"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1 min-h-[32px] rounded-full text-[11px] font-medium transition border border-white/10"
            title="Reset demo data to default baseline"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? "animate-spin" : ""}`} />
            <span>Reset Seed</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
