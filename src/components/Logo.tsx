"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "nav" | "footer" | "hero";
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({
  variant = "nav",
  className = "",
  showSubtitle = true,
}: LogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      aria-label="Sheger Wheels - Addis Ababa Premier Mobility"
      className={`group flex items-center gap-3 select-none ${className}`}
    >
      {/* Precision Automotive Crest Emblem */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Luxury Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-400/20 to-emerald-600/30 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Outer Sculpted Shield Badge */}
        <div className="relative w-10 h-10 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-slate-900 via-slate-950 to-black p-[1px] shadow-lg shadow-emerald-950/20 group-hover:scale-105 transition-all duration-300 ring-1 ring-white/10 dark:ring-white/15">
          {/* Inner Bevel & High-Gloss Surface */}
          <div className="w-full h-full rounded-[11px] bg-gradient-to-b from-slate-900/90 via-slate-950 to-black flex items-center justify-center overflow-hidden relative">
            {/* Specular Light Reflection */}
            <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

            {/* Bespoke Geometric Winged "S" Automotive Emblem */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-emerald-400 transform group-hover:rotate-3 transition-transform duration-300"
            >
              {/* Outer Precision Ring Arc */}
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="url(#sw_emerald_gold)"
                strokeWidth="1.2"
                strokeDasharray="1.5 2.5"
                opacity="0.45"
              />

              {/* Top Aerodynamic Wing Sweep */}
              <path
                d="M7 11.5C9.5 9 13.5 7.5 17 8C20.5 8.5 23.5 10.5 25 12C21.5 11.5 17.5 12 14.5 13.5C12 14.8 9 13.5 7 11.5Z"
                fill="url(#sw_emerald_grad)"
              />

              {/* Central Interlocking Dynamic 'S' Blade */}
              <path
                d="M18.5 11C20.5 12 21 14 19.5 15.5L13.5 20C11.5 21.5 12 23.5 14 24.5C17.5 24.8 21.5 23 24 20.5C21.5 22 17.5 22.5 15.5 21.5C14 20.8 14.5 19.5 15.8 18.5L21.5 14C23.5 12.5 23 10 19.5 9C16 8.5 11.5 10.5 8.5 13C11.5 11.2 16 10 18.5 11Z"
                fill="url(#sw_platinum_grad)"
              />

              {/* Bottom Aerodynamic Wing Sweep */}
              <path
                d="M25 20.5C22.5 23 18.5 24.5 15 24C11.5 23.5 8.5 21.5 7 20C10.5 20.5 14.5 20 17.5 18.5C20 17.2 23 18.5 25 20.5Z"
                fill="url(#sw_emerald_grad)"
              />

              {/* Central Starburst Apex */}
              <circle cx="16" cy="16" r="1.3" fill="#ffffff" />

              <defs>
                <linearGradient
                  id="sw_emerald_grad"
                  x1="7"
                  y1="8"
                  x2="25"
                  y2="24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#10B981" />
                  <stop offset="0.5" stopColor="#34D399" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
                <linearGradient
                  id="sw_platinum_grad"
                  x1="8.5"
                  y1="9"
                  x2="24"
                  y2="24.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFFFFF" />
                  <stop offset="0.6" stopColor="#E2E8F0" />
                  <stop offset="1" stopColor="#94A3B8" />
                </linearGradient>
                <linearGradient
                  id="sw_emerald_gold"
                  x1="3"
                  y1="3"
                  x2="29"
                  y2="29"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#10B981" />
                  <stop offset="1" stopColor="#F59E0B" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Luxury Wordmark Typography */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight leading-none">
          <span
            className={`font-black tracking-[0.14em] uppercase text-base sm:text-lg ${
              isFooter
                ? "text-white"
                : "text-slate-950 dark:text-white"
            }`}
          >
            Sheger
          </span>
          <span className="font-light tracking-[0.14em] uppercase text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 ml-1.5 font-sans">
            Wheels
          </span>
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
            <span
              className={`text-[8.5px] font-bold tracking-[0.22em] uppercase leading-none ${
                isFooter
                  ? "text-slate-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Addis Ababa • Privé Mobility
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
