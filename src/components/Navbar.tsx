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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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

            {/* User Session Pill (Shadcn DropdownMenu) */}
            {session ? (
              <DropdownMenu open={roleMenuOpen} onOpenChange={setRoleMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200 dark:border-white/15 text-slate-800 dark:text-slate-200 text-xs transition outline-none focus:ring-2 focus:ring-emerald-500/30"
                    aria-expanded={roleMenuOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-[11px] uppercase shadow-sm">
                      {session.user.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white max-w-[100px] truncate text-xs">
                      {session.user.name.split(" ")[0]}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                      {session.activeRole}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${roleMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-72 p-2">
                  <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 mb-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{session.user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
                  </div>

                  <DropdownMenuLabel>Switch Demo Persona</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleQuickSwitch("usr_renter_1", "renter")} className="flex items-center justify-between py-2 cursor-pointer">
                    <div>
                      <span className="font-semibold block text-xs">Abebe Kebede</span>
                      <span className="text-[10px] text-slate-400">Standard Renter</span>
                    </div>
                    <span className="text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full">Renter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleQuickSwitch("usr_owner_1", "owner")} className="flex items-center justify-between py-2 cursor-pointer">
                    <div>
                      <span className="font-semibold block text-xs">Dawit Haile</span>
                      <span className="text-[10px] text-slate-400">Car Host (4 vehicles)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">Owner</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleQuickSwitch("usr_admin_1", "admin")} className="flex items-center justify-between py-2 cursor-pointer">
                    <div>
                      <span className="font-semibold block text-xs">Almaz Worku</span>
                      <span className="text-[10px] text-slate-400">Platform Admin</span>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">Admin</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-500/10 py-2 cursor-pointer font-semibold">
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

          {/* Mobile Controls & Luxury Animated Hamburger */}
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

            {/* Cool Animated Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Toggle mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center relative">
                <span
                  className={`w-5 h-0.5 bg-current rounded-full transform transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-current rounded-full transition-all duration-200 ease-in-out ${
                    mobileMenuOpen ? "opacity-0 translate-x-2" : "opacity-100"
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-current rounded-full transform transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with Smooth Animated Transition */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "max-h-[600px] opacity-100 border-t border-slate-200/80 dark:border-white/10"
            : "max-h-0 opacity-0 pointer-events-none"
        } bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl`}
      >
        <div className="px-5 pt-4 pb-6 space-y-4">
          <div className="space-y-1">
            <Link
              href="/cars"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
            >
              Browse Cars in Addis Ababa
            </Link>
            <Link
              href="/owner/cars/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
            >
              + List Your Car
            </Link>
            {session && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
                >
                  Renter Dashboard & Trips
                </Link>
                {session.user.roles.includes("owner") && (
                  <Link
                    href="/owner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-white/5 transition"
                  >
                    Host Operations Hub
                  </Link>
                )}
                {session.user.roles.includes("admin") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-white/5 transition"
                  >
                    Admin Console
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/80 dark:border-white/10">
            {session ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Signed in as <strong className="text-slate-900 dark:text-white">{session.user.name}</strong> ({session.activeRole})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickSwitch("usr_renter_1", "renter")}
                    className="py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-xs rounded-xl font-medium text-slate-800 dark:text-slate-200 transition"
                  >
                    Renter
                  </button>
                  <button
                    onClick={() => handleQuickSwitch("usr_owner_1", "owner")}
                    className="py-1.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-xs rounded-xl font-medium text-emerald-700 dark:text-emerald-300 transition"
                  >
                    Host
                  </button>
                  <button
                    onClick={() => handleQuickSwitch("usr_admin_1", "admin")}
                    className="py-1.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 text-xs rounded-xl font-medium text-purple-700 dark:text-purple-300 transition"
                  >
                    Admin
                  </button>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-center py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm shadow-emerald-700/25"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
