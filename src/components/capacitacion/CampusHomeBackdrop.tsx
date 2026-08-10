"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/imagen1.jpeg",
  "/images/imagen2.jpg",
  "/images/imagen3.jpg",
] as const;

const INTERVAL_MS = 7000;

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
      {SLIDES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover ${index === active ? "animate-campus-kenburns" : "scale-105"}`}
          />
        </div>
      ))}

      {/* Soften busy photos without killing atmosphere */}
      <div className="absolute inset-0 bg-brand-navy/55 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/75 via-brand-navy/60 to-brand-black/90" />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 50% 20%, rgba(255,140,0,0.14), transparent 60%)",
        }}
      />
    </div>
  );
}
