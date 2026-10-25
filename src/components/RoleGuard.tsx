"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, useIsMounted } from "@/lib/useStorage";
import { UserRole } from "@/types";
import { ShieldAlert, AlertCircle, LogIn } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  requiredRole?: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const isMounted = useIsMounted();
  const { session, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && isMounted) {
      if (!session) {
        router.push(`/signin?returnUrl=${encodeURIComponent(pathname)}`);
      }
    }
  }, [session, loading, isMounted, pathname, router]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium text-sm">Verifying demo permissions...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
        <p className="text-sm text-slate-600 mb-6">
          You need an active session to access this portal. Please select a demo account to continue.
        </p>
        <Link
          href={`/signin?returnUrl=${encodeURIComponent(pathname)}`}
          className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          Go to Demo Sign In
        </Link>
      </div>
    );
  }

  // Account suspension check
  if (session.user.status === "suspended") {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 rounded-2xl border border-rose-200 text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-rose-900 mb-2">Account Suspended</h2>
        <p className="text-sm text-rose-700 mb-6">
          This demo account ({session.user.email}) has been suspended by an administrator. Protected actions and booking management are restricted.
        </p>
        <Link
          href="/signin"
          className="inline-block px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition"
        >
          Switch to Active Demo Account
        </Link>
      </div>
    );
  }

  // Required role check
  if (requiredRole && !session.user.roles.includes(requiredRole)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-4">
          This portal requires the <span className="font-bold uppercase text-emerald-600">{requiredRole}</span> role. Your current account ({session.user.name}) does not hold this permission.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 mb-6 text-left">
          <strong>Security note:</strong> Frontend role checks protect client views, while mutation functions enforce permissions against browser storage. In production, backend authorization tokens are required.
        </div>
        <Link
          href="/signin"
          className="inline-block px-4 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-xl hover:bg-navy-800 transition"
        >
          Switch to Authorized Demo Account
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
