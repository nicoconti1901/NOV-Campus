"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { CapacitacionBackground } from "@/components/capacitacion/CapacitacionBackground";

type MethodKey = "legajo" | "email" | "sso" | "2fa" | "pin" | "enlace";

const COPY: Record<
  MethodKey,
  {
    kicker: string;
    title: string;
    hint: string;
    activeNote: string;
    activeHref: string;
    activeLabel: string;
  }
> = {
  legajo: {
    kicker: "Personal · Muestra",
    title: "Ingreso con número de legajo",
    hint: "El empleado usa el número interno. En producción se cruza con RR.HH.",
    activeNote: "En este demo el ingreso activo del personal es por DNI.",
    activeHref: "/capacitacion",
    activeLabel: "Volver y probar DNI",
  },
  email: {
    kicker: "Personal · Muestra",
    title: "Ingreso con email corporativo",
    hint: "Cuenta de la compañía, con recuperación de clave.",
    activeNote: "En este demo el ingreso activo del personal es por DNI.",
    activeHref: "/capacitacion",
    activeLabel: "Volver y probar DNI",
  },
  sso: {
    kicker: "Muestra SSO",
    title: "Continuar con la cuenta de empresa",
    hint: "Un clic con Microsoft 365 o el directorio activo.",
    activeNote: "Esta vía se habilita cuando el cliente tiene SSO. El demo activo usa DNI o email de capacitador.",
    activeHref: "/capacitacion",
    activeLabel: "Volver a los módulos",
  },
  "2fa": {
    kicker: "Capacitadores · Muestra",
    title: "Acceso con doble factor",
    hint: "Después de la contraseña, un código de 6 dígitos.",
    activeNote: "En este demo el capacitador entra con email y contraseña, sin 2FA.",
    activeHref: "/capacitacion/admin/login",
    activeLabel: "Probar email y contraseña",
  },
  pin: {
    kicker: "Progreso · Muestra",
    title: "PIN de supervisión",
    hint: "Código corto para abrir las matrices en un monitor o sala.",
    activeNote: "La vía activa de este módulo no pide PIN: abre las matrices directo.",
    activeHref: "/capacitacion/matrices",
    activeLabel: "Ver matrices sin sesión",
  },
  enlace: {
    kicker: "Progreso · Muestra",
    title: "Enlace de supervisión",
    hint: "URL privada, sin usuario. En un cliente real vence o se limita por red.",
    activeNote: "En este demo las matrices se abren sin enlace secreto.",
    activeHref: "/capacitacion/matrices",
    activeLabel: "Ver matrices sin sesión",
  },
};

function DemoAccessForm() {
  const searchParams = useSearchParams();
  const metodo = (searchParams.get("metodo") ?? "legajo") as MethodKey;
  const copy = COPY[metodo] ?? COPY.legajo;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-brand-black/70 backdrop-blur-md">
        <div className="bg-gradient-to-br from-brand-dark to-brand-navy px-8 py-6 text-center text-white">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">
            {copy.kicker}
          </p>
          <h1 className="mt-2 font-display text-xl font-semibold uppercase tracking-[0.08em]">{copy.title}</h1>
          <p className="mt-2 text-sm text-white/70">{copy.hint}</p>
        </div>

        <div className="p-8">
          <Link href="/capacitacion" className="flex justify-center">
            <BrandLogo size="lg" />
          </Link>

          <div className="mt-8 space-y-4">
            {metodo === "legajo" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-white/80">Número de legajo</span>
                <input
                  disabled
                  placeholder="Ej: 45821"
                  className="w-full rounded-xl border border-white/12 bg-[#161a20] px-4 py-3 text-sm text-white/80 opacity-90"
                />
              </label>
            ) : null}

            {metodo === "email" || metodo === "2fa" ? (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-white/80">Email corporativo</span>
                  <input
                    disabled
                    type="email"
                    placeholder="nombre.apellido@nov.com"
                    className="w-full rounded-xl border border-white/12 bg-[#161a20] px-4 py-3 text-sm text-white/80 opacity-90"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-white/80">Contraseña</span>
                  <input
                    disabled
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/12 bg-[#161a20] px-4 py-3 text-sm text-white/80 opacity-90"
                  />
                </label>
              </>
            ) : null}

            {metodo === "2fa" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-white/80">Código de 6 dígitos</span>
                <input
                  disabled
                  placeholder="000 000"
                  className="w-full rounded-xl border border-white/12 bg-[#161a20] px-4 py-3 text-sm tracking-[0.3em] text-white/80 opacity-90"
                />
              </label>
            ) : null}

            {metodo === "sso" ? (
              <button
                type="button"
                disabled
                className="w-full rounded-xl border border-white/12 bg-[#161a20] py-3 text-sm font-semibold text-white/80 opacity-90"
              >
                Continuar con Microsoft 365
              </button>
            ) : null}

            {metodo === "pin" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-white/80">PIN de supervisión</span>
                <input
                  disabled
                  placeholder="••••"
                  className="w-full rounded-xl border border-white/12 bg-[#161a20] px-4 py-3 text-center text-lg tracking-[0.4em] text-white/80 opacity-90"
                />
              </label>
            ) : null}

            {metodo === "enlace" ? (
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                Ejemplo: /capacitacion/matrices?token=sup-8f3a… (en un cliente real el token vence).
              </p>
            ) : null}

            {metodo !== "sso" && metodo !== "enlace" ? (
              <button
                type="button"
                disabled
                className="w-full rounded-xl bg-brand-red/50 py-3 text-sm font-semibold text-white"
              >
                Ingresar (muestra)
              </button>
            ) : null}

            <p className="text-sm leading-relaxed text-white/55">{copy.activeNote}</p>
            <Link
              href={copy.activeHref}
              className="inline-flex w-full items-center justify-center rounded-xl bg-white/10 py-3 text-sm font-semibold text-white hover:bg-white/15"
            >
              {copy.activeLabel}
            </Link>
          </div>

          <Link
            href="/capacitacion"
            className="mt-6 block text-center text-sm text-white/50 transition-colors hover:text-brand-red"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DemoAccessPage() {
  return (
    <CapacitacionBackground>
      <Suspense fallback={<div className="min-h-screen" />}>
        <DemoAccessForm />
      </Suspense>
    </CapacitacionBackground>
  );
}
