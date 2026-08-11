"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/imagen1.jpeg",
  "/images/imagen2.jpg",
  "/images/imagen3.jpg",
] as const;

const INTERVAL_MS = 8000;
const FADE_MS = 2800;

export function CampusHomeBackdrop() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {SLIDES.map((src, index) => {
        const isActive = index === active;
        return (
          <div
            key={src}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              willChange: "opacity",
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center scale-[1.08]"
            />
          </div>
        );
      })}

      {/* Stable overlays — same for every slide so the cut feels seamless */}
      <div className="absolute inset-0 bg-brand-navy/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 via-brand-navy/65 to-brand-black/92" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 50% 20%, rgba(255,140,0,0.12), transparent 60%)",
        }}
      />
    </div>
  );
}
