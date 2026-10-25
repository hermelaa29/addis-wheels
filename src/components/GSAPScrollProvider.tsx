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
        // 1. Reveal page headings with bidirectional play/reverse
        const pageHeadings = mainRef.current?.querySelectorAll("h1, h2");
        if (pageHeadings && pageHeadings.length > 0) {
          pageHeadings.forEach((heading, i) => {
            if (!heading) return;
            gsap.fromTo(
              heading,
              {
                opacity: 0,
                x: i % 2 === 0 ? -45 : 45,
                y: 15,
              },
              {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.75,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: heading,
                  start: "top 92%",
                  end: "bottom 10%",
                  toggleActions: "play reverse play reverse",
                },
              }
            );
          });
        }

        // 2. Batch scroll reveal with alternating left/right directions and bidirectional entry/exit
        const animatedTargets = mainRef.current?.querySelectorAll(
          "section > div, .rounded-3xl, .rounded-2xl, article, table, form"
        );

        if (animatedTargets && animatedTargets.length > 0) {
          animatedTargets.forEach((target, index) => {
            if (!target) return;
            const fromLeft = index % 2 === 0;
            const initX = fromLeft ? -50 : 50;

            gsap.fromTo(
              target,
              {
                opacity: 0,
                x: initX,
                y: 20,
                scale: 0.98,
              },
              {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: target,
                  start: "top 88%",
                  end: "bottom 10%",
                  toggleActions: "play reverse play reverse",
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
