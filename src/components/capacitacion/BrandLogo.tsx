import Image from "next/image";
import { siteConfig } from "@/lib/data";

type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: "h-9 w-auto",
  md: "h-11 w-auto",
  lg: "h-16 w-auto",
  xl: "h-20 w-auto sm:h-24",
} as const;

export function BrandLogo({ size = "md", className = "", priority = false }: Props) {
  return (
    <Image
      src="/images/logo-on-dark.png"
      alt={siteConfig.name}
      width={1400}
      height={543}
      className={`shrink-0 object-contain ${sizes[size]} ${className}`}
      priority={priority}
    />
  );
}
