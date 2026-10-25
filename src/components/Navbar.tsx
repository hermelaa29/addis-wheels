"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/useStorage";
import { signOut, signInAsDemo } from "@/lib/data";
import { NotificationBell } from "./NotificationBell";
import { useTheme } from "@/lib/useTheme";
import { Logo } from "./Logo";
import {
  Car,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Compass,
  PlusCircle,
  Briefcase,
  Layers,
  ShieldCheck,
  User,
  Sun,
  Moon,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useSession();
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleQuickSwitch = (userId: string, role: "renter" | "owner" | "admin") => {
    signInAsDemo(userId, role);
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    if (role === "admin") router.push("/admin");
    else if (role === "owner") router.push("/owner");
    else router.push("/dashboard");
  };

  const navLinks = [
    { href: "/cars", label: "Browse Fleet", icon: Compass },
    { href: "/dashboard", label: "My Trips", icon: Layers, auth: true },
    { href: "/owner", label: "Host Portal", icon: Briefcase, role: "owner" as const },
    { href: "/admin", label: "Admin Console", icon: ShieldCheck, role: "admin" as const },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-navy-950/90 backdrop-blur-md text-slate-800 dark:text-white border-b border-slate-200/80 dark:border-white/10 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Logo variant="nav" />

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10">
            {navLinks.map((link) => {
              if (link.auth && !session) return null;
              if (link.role && (!session || !session.user.roles.includes(link.role))) return null;
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/owner/cars/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-200 dark:border-white/10 transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> List Your Car
            </Link>

            <NotificationBell />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition focus:outline-none"
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 animate-in spin-in-90 duration-200" />
              )}
            </button>

            {/* User Session Pill */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 text-xs transition"
                  aria-expanded={roleMenuOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-navy-950 flex items-center justify-center font-bold text-[11px] uppercase shadow-sm">
                    {session.user.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-white max-w-[100px] truncate text-xs">
                    {session.user.name.split(" ")[0]}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                    {session.activeRole}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 text-slate-800 overflow-hidden py-1 animate-in fade-in duration-100">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{session.user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
                    </div>

                    <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Switch Demo Persona
                    </div>
                    <button
                      onClick={() => handleQuickSwitch("usr_renter_1", "renter")}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
                    >
                      <div>
                        <span className="font-semibold block">Abebe Kebede</span>
                        <span className="text-[10px] text-slate-400">Standard Renter</span>
                      </div>
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">Renter</span>
                    </button>
                    <button
                      onClick={() => handleQuickSwitch("usr_owner_1", "owner")}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
                    >
                      <div>
                        <span className="font-semibold block">Dawit Haile</span>
                        <span className="text-[10px] text-slate-400">Car Host (4 vehicles)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Owner</span>
                    </button>
                    <button
                      onClick={() => handleQuickSwitch("usr_admin_1", "admin")}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
                    >
                      <div>
                        <span className="font-semibold block">Almaz Worku</span>
                        <span className="text-[10px] text-slate-400">Platform Admin</span>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">Admin</span>
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm shadow-emerald-700/30"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              {mounted && theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              )}
            </button>
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-white/10 px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <Link
              href="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Browse Cars in Addis Ababa
            </Link>
            <Link
              href="/owner/cars/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-white/5"
            >
              + List Your Car
            </Link>
            {session && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
                >
                  Renter Dashboard & Trips
                </Link>
                {session.user.roles.includes("owner") && (
                  <Link
                    href="/owner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
                  >
                    Host Operations Hub
                  </Link>
                )}
                {session.user.roles.includes("admin") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold text-purple-300 hover:bg-white/5"
                  >
                    Admin Console
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-white/10">
            {session ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-400">
                  Signed in as <strong className="text-white">{session.user.name}</strong> ({session.activeRole})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickSwitch("usr_renter_1", "renter")}
                    className="py-1.5 bg-white/10 text-xs rounded-lg font-medium text-slate-200"
                  >
                    Renter
                  </button>
                  <button
                    onClick={() => handleQuickSwitch("usr_owner_1", "owner")}
                    className="py-1.5 bg-white/10 text-xs rounded-lg font-medium text-emerald-300"
                  >
                    Host
                  </button>
                  <button
                    onClick={() => handleQuickSwitch("usr_admin_1", "admin")}
                    className="py-1.5 bg-white/10 text-xs rounded-lg font-medium text-purple-300"
                  >
                    Admin
                  </button>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-center py-2 text-xs font-semibold text-rose-400 bg-white/5 hover:bg-white/10 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
