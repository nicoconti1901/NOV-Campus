import Image from "next/image";
import { siteConfig } from "@/lib/data";

export function CampusFooter() {
  return (
    <footer className="relative mt-auto shrink-0 overflow-hidden border-t border-neutral-200 bg-[#eceff2] text-neutral-900">
      <span className="absolute inset-x-0 top-0 h-px bg-[#e85d04]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 50%, #e85d04 0.9px, transparent 1.1px), radial-gradient(circle at 82% 40%, #111 0.8px, transparent 1px)",
          backgroundSize: "28px 28px, 42px 42px",
        }}
      />
      <div className="relative mx-auto flex h-[5.5rem] max-w-screen-2xl items-center justify-between gap-5 px-4 sm:h-[6rem] sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.04em] text-neutral-800">
            © {new Date().getFullYear()} DEVCEN
          </p>
          <p className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            <span className="inline-block h-3 w-px shrink-0 bg-[#e85d04]" />
            <span className="truncate">Connected Systems</span>
            <span className="hidden text-neutral-300 sm:inline">/</span>
            <span className="hidden truncate sm:inline">{siteConfig.tagline}</span>
          </p>
        </div>
        <div className="relative h-[4.25rem] w-[min(58vw,22rem)] shrink-0 sm:h-[4.75rem]">
          <Image
            src="/images/logoDEVCEN.png"
            alt="DEVCEN Connected Systems"
            fill
            sizes="22rem"
            className="object-contain object-right"
            priority
          />
          <span className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-[#eceff2] to-transparent" />
        </div>
      </div>
    </footer>
  );
}
