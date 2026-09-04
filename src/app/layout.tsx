import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { CampusAtmosphere } from "@/components/capacitacion/CampusAtmosphere";
import { MotionRoot } from "@/components/capacitacion/MotionRoot";
import { siteConfig } from "@/lib/data";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className={`${dmSans.variable} ${oswald.variable} font-sans antialiased`}>
        <MotionRoot>
          <CampusAtmosphere />
          {children}
        </MotionRoot>
      </body>
    </html>
  );
}
