import Image from "next/image";
import { siteConfig } from "@/lib/data";

type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: { px: 48, box: "h-12 w-12" },
  md: { px: 56, box: "h-14 w-14" },
  lg: { px: 96, box: "h-24 w-24" },
  xl: { px: 140, box: "h-[8.75rem] w-[8.75rem]" },
} as const;

export function BrandLogo({ size = "md", className = "", priority = false }: Props) {
  const { px, box } = sizes[size];

  return (
    <Image
      src="/images/logo.jpeg"
      alt={siteConfig.name}
      width={px}
      height={px}
      className={`shrink-0 rounded-full bg-black object-contain ${box} ${className}`}
      priority={priority}
    />
  );
}
