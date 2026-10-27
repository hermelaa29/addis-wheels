"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
}

export function GSAPScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mainRef.current) return;
    if (pathname === "/") return; // Homepage has dedicated custom choreographed animations

    // Small delay to ensure React DOM hydration has completed
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // 1. Reveal page headings with subtle, graceful upward fade
        const pageHeadings = mainRef.current?.querySelectorAll("h1, h2");
        if (pageHeadings && pageHeadings.length > 0) {
          pageHeadings.forEach((heading) => {
            if (!heading) return;
            gsap.fromTo(
              heading,
              {
                opacity: 0,
                y: 14,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: heading,
                  start: "top 94%",
                  once: true,
                },
              }
            );
          });
        }

        // 2. Smooth, calm card and section reveals (subtle vertical lift, no alternating left/right jolts)
        const animatedTargets = mainRef.current?.querySelectorAll(
          "section > div, .rounded-3xl, .rounded-2xl, article, table, form"
        );

        if (animatedTargets && animatedTargets.length > 0) {
          animatedTargets.forEach((target) => {
            if (!target) return;
            gsap.fromTo(
              target,
              {
                opacity: 0,
                y: 16,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: target,
                  start: "top 92%",
                  once: true,
                },
              }
            );
          });
        }
      }, mainRef);

      return () => {
        ctx.revert();
      };
    }, 60);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [pathname]);

  return (
    <div ref={mainRef} className="flex-1 flex flex-col w-full">
      {children}
    </div>
  );
}
