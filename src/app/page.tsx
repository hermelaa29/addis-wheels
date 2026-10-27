"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CarCard } from "@/components/CarCard";

const ThreeHeroCar = dynamic(
  () => import("@/components/ThreeHeroCar").then((m) => m.ThreeHeroCar),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-w-lg lg:max-w-none flex items-center justify-center select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-[80px] pointer-events-none -z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-car-cutout.png"
          alt="Suzuki Swift DualJet"
          width={480}
          height={270}
          fetchPriority="high"
          decoding="async"
          className="max-h-[85%] max-w-[90%] object-contain drop-shadow-2xl"
        />
        <div className="absolute bottom-2 inset-x-3 sm:inset-x-6 z-20 flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/80 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/40">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black tracking-wide text-slate-950 dark:text-white uppercase">
                Suzuki Swift DualJet
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Pearl White • 1.2L DualJet • 23 km/L • 5-Speed
            </span>
          </div>
        </div>
      </div>
    ),
  }
);
import { getCars } from "@/lib/data";
import { SEED_CARS } from "@/lib/seedData";
import { useIsMounted } from "@/lib/useStorage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Search,
  Calendar,
  MapPin,
  Shield,
  CreditCard,
  Key,
  Users,
  Car,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
}

export default function HomePage() {
  const router = useRouter();
  const isMounted = useIsMounted();
  const [neighbourhood, setNeighbourhood] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (neighbourhood && neighbourhood !== "all") {
      params.set("neighbourhood", neighbourhood);
    }
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);

    router.push(`/cars?${params.toString()}`);
  };

  const allApprovedCars = useMemo(() => {
    if (!isMounted) return SEED_CARS.filter((c) => c.status === "approved");
    const cars = getCars({ status: "approved" });
    return cars.length > 0 ? cars : SEED_CARS.filter((c) => c.status === "approved");
  }, [isMounted]);

  const featuredCars = useMemo(() => {
    if (activeCategory === "all") return allApprovedCars.slice(0, 4);
    if (activeCategory === "suv") {
      return allApprovedCars.filter((c) =>
        ["Rav4 Hybrid", "Tucson", "Land Cruiser Prado", "Sportage"].some((m) => c.model.includes(m))
      );
    }
    if (activeCategory === "sedan") {
      return allApprovedCars.filter((c) => ["Dzire", "C200"].some((m) => c.model.includes(m)));
    }
    if (activeCategory === "bole") {
      return allApprovedCars.filter((c) => c.neighbourhood === "Bole");
    }
    return allApprovedCars.slice(0, 4);
  }, [allApprovedCars, activeCategory]);

  // --- GSAP SCROLL ANIMATIONS FOR ALL PAGE ELEMENTS ---
  useEffect(() => {
    if (typeof window === "undefined" || !pageContainerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Hero Reveal: Subtle, harmonious vertical fade-up
      const heroTitles = pageContainerRef.current?.querySelectorAll(".gsap-hero-title");
      if (heroTitles && heroTitles.length > 0) {
        gsap.fromTo(
          heroTitles,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
        );
      }

      const heroDesc = pageContainerRef.current?.querySelector(".gsap-hero-desc");
      if (heroDesc) {
        gsap.fromTo(
          heroDesc,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.1, ease: "power2.out" }
        );
      }

      const heroStats = pageContainerRef.current?.querySelector(".gsap-hero-stats");
      if (heroStats) {
        gsap.fromTo(
          heroStats,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.65, delay: 0.18, ease: "power2.out" }
        );
      }

      const searchPanel = pageContainerRef.current?.querySelector(".gsap-search-panel");
      if (searchPanel) {
        gsap.fromTo(
          searchPanel,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.75, delay: 0.22, ease: "power2.out" }
        );
      }

      const heroCar = pageContainerRef.current?.querySelector(".gsap-hero-car");
      if (heroCar) {
        gsap.fromTo(
          heroCar,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.15, ease: "power2.out" }
        );
      }

      // 2. Trust Guarantees Strip: Smooth, calm staggered fade-up
      const trustItems = pageContainerRef.current?.querySelectorAll(".gsap-trust-item");
      if (trustItems && trustItems.length > 0) {
        gsap.fromTo(
          trustItems,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: trustItems[0],
              start: "top 94%",
              once: true,
            },
          }
        );
      }

      // 3. Featured Fleet Header: Graceful fade-up
      const featuredHeader = pageContainerRef.current?.querySelector(".gsap-featured-header");
      const featuredSection = pageContainerRef.current?.querySelector(".gsap-featured-section") || featuredHeader;
      if (featuredHeader && featuredSection) {
        gsap.fromTo(
          featuredHeader,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featuredSection,
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      // 4. Featured Car Cards: Cohesive, luxurious staggered card reveal (rock-solid, non-distracting)
      const carCards = pageContainerRef.current?.querySelectorAll(".gsap-car-card");
      if (carCards && carCards.length > 0) {
        gsap.fromTo(
          carCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: carCards[0],
              start: "top 90%",
              once: true,
            },
          }
        );
      }

      // 5. How It Works Section: Smooth unified presentation
      const hiwHeader = pageContainerRef.current?.querySelector(".gsap-hiw-header");
      const hiwSection = pageContainerRef.current?.querySelector(".gsap-hiw-section") || hiwHeader;
      if (hiwHeader && hiwSection) {
        gsap.fromTo(
          hiwHeader,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: hiwSection,
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      const hiwCards = pageContainerRef.current?.querySelectorAll(".gsap-hiw-card-left, .gsap-hiw-card-right");
      if (hiwCards && hiwCards.length > 0) {
        gsap.fromTo(
          hiwCards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: hiwCards[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      // 6. Platform Guarantees Section: Harmonious 3-card staggered reveal
      const guaranteeCards = pageContainerRef.current?.querySelectorAll(".gsap-guarantee-card");
      if (guaranteeCards && guaranteeCards.length > 0) {
        gsap.fromTo(
          guaranteeCards,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: guaranteeCards[0],
              start: "top 90%",
              once: true,
            },
          }
        );
      }

      // 7. Call To Action Banner: Subtle, refined lift
      const ctaContent = pageContainerRef.current?.querySelector(".gsap-cta-content");
      const ctaSection = pageContainerRef.current?.querySelector(".gsap-cta-section") || ctaContent;
      if (ctaContent && ctaSection) {
        gsap.fromTo(
          ctaContent,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaSection,
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, [featuredCars]);

  return (
    <div ref={pageContainerRef} className="flex flex-col flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-clip">
      {/* Hero Section with Minimized Height, Left-Aligned Text & Right 3D Car Showcase */}
      <section className="relative py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-white/5">
        {/* Subtle Ambient Luxury Lighting & Geometric Grid */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 right-1/4 w-[500px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 left-10 w-[400px] h-[220px] bg-teal-500/10 rounded-full blur-[110px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Premium Text & Compact Discovery Bar */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              {/* Elite Insignia Emblem Badge */}
              <div className="gsap-hero-title inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-white/5 border border-emerald-500/20 dark:border-white/10 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase text-emerald-800 dark:text-emerald-400">
                  ETHIOPIA&apos;S PREMIER MOBILITY ARCHITECTURE
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-widest uppercase">
                  ADDIS ABABA
                </span>
              </div>

              {/* Editorial Luxury Headline */}
              <h1 className="gsap-hero-title text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.06] text-slate-950 dark:text-white">
                DRIVE EXCELLENCE. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-200 dark:to-emerald-100">
                  EXPERIENCE EXTRAORDINARY.
                </span>
              </h1>

              {/* Editorial Sub-Copy */}
              <p className="gsap-hero-desc text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
                Curated peer-to-peer mobility across Bole, Kazanchis, and Old Airport. Transparent Birr pricing, verified private hosts, and direct white-glove handover.
              </p>

              {/* Distinction Stat Pills */}
              <div className="gsap-hero-stats flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Insured Hosts</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>VIP Bole Handover</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Flat 10% Fee</span>
                </div>
              </div>

              {/* Compact Concierge Booking Search Console */}
              <div className="gsap-search-panel bg-white dark:bg-slate-900/80 rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-slate-900/5 dark:shadow-black/40 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl max-w-2xl">
                <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center" role="search" aria-label="Addis Ababa car search">
                  {/* Pick-Up Hub (5 cols) */}
                  <div className="sm:col-span-5 px-2.5 py-1 sm:border-r border-slate-200 dark:border-slate-800 text-left">
                    <label htmlFor="hero-neighbourhood" className="block text-[9.5px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" /> Pick-Up Hub
                    </label>
                    <Select value={neighbourhood} onValueChange={(val) => setNeighbourhood(val)}>
                      <SelectTrigger id="hero-neighbourhood" className="h-8 border-none bg-transparent px-0 py-0 text-xs font-bold text-slate-900 dark:text-white focus:ring-0 shadow-none">
                        <SelectValue placeholder="All Addis Ababa Hubs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Addis Ababa Hubs</SelectItem>
                        <SelectItem value="Bole">Bole (Airport & Express)</SelectItem>
                        <SelectItem value="Kazanchis">Kazanchis (Business District)</SelectItem>
                        <SelectItem value="Old Airport">Old Airport (Diplomatic)</SelectItem>
                        <SelectItem value="Sarbet">Sarbet</SelectItem>
                        <SelectItem value="Piassa">Piassa</SelectItem>
                        <SelectItem value="CMC">CMC</SelectItem>
                        <SelectItem value="Megenagna">Megenagna</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Departure Date (4 cols) */}
                  <div className="sm:col-span-4 px-2.5 py-1 text-left">
                    <label htmlFor="hero-start-date" className="block text-[9.5px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" /> Pickup Date
                    </label>
                    <input
                      id="hero-start-date"
                      name="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    />
                  </div>

                  {/* Explore Button (3 cols) */}
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      aria-label="Find available cars across Addis Ababa"
                      className="w-full h-10 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-700/25 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="tracking-wide">Explore</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Trust Subtext */}
              <div className="gsap-trust-strip flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                <span className="gsap-trust-item flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Authenticated Host Profiles
                </span>
                <span className="gsap-trust-item flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Telebirr & CBE Integrated
                </span>
              </div>
            </div>

            {/* Right Column: Interactive 3D Three.js Car Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="gsap-hero-car w-full flex items-center justify-center">
                <ThreeHeroCar
                  imageUrl="/hero-car-cutout.png"
                  carName="Suzuki Swift DualJet"
                  carSpec="Pearl White • 1.2L DualJet • 23 km/L • 5-Speed"
                  hubLocation="Bole, Piassa & Kazanchis Hubs"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fleet Showcase */}
      <section className="gsap-featured-section py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl mb-12">
          <div className="gsap-featured-header flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                Handpicked Vehicles
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Featured Fleet in Addis Ababa
              </h2>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Vehicles" },
                { id: "suv", label: "SUVs & 4WD" },
                { id: "sedan", label: "City Sedans" },
                { id: "bole", label: "Bole Hub" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-label={`Filter by ${cat.label}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    activeCategory === cat.id
                      ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {featuredCars.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading featured vehicles...</p>
            </div>
          ) : (
            <div className="gsap-cars-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCars.map((car, index) => (
                <div
                  key={car.id}
                  className="gsap-car-card"
                >
                  <CarCard car={car} priority={index === 0} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition"
            >
              <span>Explore all {allApprovedCars.length} available cars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="gsap-hiw-section py-16 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="gsap-hiw-header text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">
              Simple & Streamlined
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              How Sheggar Wheels Operates
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2">
              A frictionless rental experience built specifically for the streets and rhythm of Addis Ababa.
            </p>
          </div>

          <div className="gsap-hiw-cards grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Renters Card */}
            <div className="gsap-hiw-card gsap-hiw-card-left bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Renters</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reserve wheels in 3 quick steps</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Find the right car</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Filter by neighborhood, price in ETB, seats, or transmission.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Book & checkout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Transparent quote with automatic 10% platform service fee breakdown.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pick up & drive</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Meet your verified host, inspect the car, and hit the road.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/cars"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                >
                  <span>Explore available cars</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* For Hosts Card */}
            <div className="gsap-hiw-card gsap-hiw-card-right bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">For Vehicle Hosts</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Earn income on your idle vehicle</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">List your vehicle</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Upload specs, daily rates, pickup point in Addis, and photos.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Manage bookings</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Approve or decline requests with automatic conflict prevention.</p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Receive 90% payout</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Track revenue, export earnings CSVs, and reply to reviews.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/owner/cars/new"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                >
                  <span>List your car now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Guarantees Section */}
      <section className="gsap-guarantees-section py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h2 className="sr-only">Platform Trust and Guarantees</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="gsap-guarantee-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Verified Addis Hosts</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every host and listing undergoes moderation. Review ratings and community reviews before committing.
            </p>
          </div>

          <div className="gsap-guarantee-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-2xl bg-navy-50 dark:bg-navy-900/60 text-navy-800 dark:text-navy-300 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Clear Pricing in ETB</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Transparent daily rental fees with 10% platform charge. No hidden surcharges or surprise deposits.
            </p>
          </div>

          <div className="gsap-guarantee-card p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">Local Community</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Support local car owners across Addis Ababa neighborhoods while enjoying flexible rental options.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner with Minimized Height & Fixed Sticky Background */}
      <section
        className="gsap-cta-section relative text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-white/10 bg-fixed bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2000&q=85')`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >

        <div className="gsap-cta-content max-w-3xl mx-auto text-center space-y-4 relative z-10 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ready for the Addis Ababa Open Road?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
            Ready to experience Sheggar Wheels?
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Browse our diverse fleet of SUVs, sedans, and luxury cruisers across Addis Ababa, or turn your parked car into steady income.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/cars"
              className="px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-900/50 hover:scale-105 active:scale-95"
            >
              Browse Cars Fleet
            </Link>
            <Link
              href="/owner/cars/new"
              className="px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-xs sm:text-sm transition border border-white/30 backdrop-blur-md hover:scale-105 active:scale-95"
            >
              List Your Car
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
