import React from "react";
import Link from "next/link";
import { Car, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto bg-navy-950 text-slate-300 border-t border-white/10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <Logo variant="footer" />
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Addis Ababa&apos;s premier peer-to-peer vehicle sharing community. Rent verified cars from trusted local owners across the capital.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Addis Ababa, Ethiopia
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-white text-[10px] tracking-widest uppercase mb-3">Explore Fleet</h3>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/cars" className="text-slate-300 hover:text-white transition">
                  Browse Fleet
                </Link>
              </li>
              <li>
                <Link href="/cars?neighbourhood=Bole" className="text-slate-300 hover:text-white transition">
                  Bole Hub
                </Link>
              </li>
              <li>
                <Link href="/cars?neighbourhood=Kazanchis" className="text-slate-300 hover:text-white transition">
                  Kazanchis Hub
                </Link>
              </li>
              <li>
                <Link href="/cars?transmission=automatic" className="text-slate-300 hover:text-white transition">
                  Automatic Vehicles
                </Link>
              </li>
              <li>
                <Link href="/owner/cars/new" className="text-emerald-400 hover:text-emerald-300 transition font-semibold">
                  + List Your Car
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="font-bold text-white text-[10px] tracking-widest uppercase mb-3">Portals & Workflows</h3>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition">
                  Renter Dashboard
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-slate-300 hover:text-white transition">
                  Trip History & Receipts
                </Link>
              </li>
              <li>
                <Link href="/owner" className="text-slate-300 hover:text-white transition">
                  Host Operations Hub
                </Link>
              </li>
              <li>
                <Link href="/owner/earnings" className="text-slate-300 hover:text-white transition">
                  Host Earnings (90% Payout)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-purple-300 hover:text-purple-200 transition font-semibold">
                  Administrator Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Notice Box */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-[10px] tracking-widest uppercase mb-3 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Prototype Notice
            </h3>
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-slate-200 leading-relaxed space-y-1.5">
              <p>
                Sheggar Wheels is a client-side capstone application prototype. Data persists in your browser storage.
              </p>
              <p className="text-[11px] text-slate-300">
                Simulated Telebirr payments and simulated Addis Ababa route corridors.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-300 gap-3">
          <p>© {new Date().getFullYear()} Sheggar Wheels. Capstone Demonstration Project.</p>
          <p>Built with Next.js App Router, TypeScript & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
