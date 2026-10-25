import Link from "next/link";
import { Car, Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Car className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            404 Error
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Page Not Found</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The page or route you were looking for does not exist on Sheggar Wheels or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold transition"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
          <Link
            href="/cars"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
          >
            <Compass className="w-3.5 h-3.5" /> Browse Fleet
          </Link>
        </div>
      </div>
    </div>
  );
}
