"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = ["/images/fondo.webp", "/images/fondo1.webp", "/images/fondo3.jpg"] as const;

const INTERVAL_MS = 7500;
const FADE_MS = 1600;

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
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center scale-[1.06]"
            />
          </div>
        );
      })}

      <div className="absolute inset-0 bg-brand-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 via-brand-navy/45 to-brand-black/90" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 50% 18%, rgba(237,50,41,0.16), transparent 58%)",
        }}
      />
    </div>
  );
}
