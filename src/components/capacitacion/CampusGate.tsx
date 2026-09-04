"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, GraduationCap, Shield } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  studentLoginHref: string | null;
};

const MODULES = [
  {
    key: "participants",
    title: "Participantes",
    detail: "Ingreso con DNI habilitado. Cursas lo asignado a tu celda.",
    hrefKey: "student" as const,
    icon: GraduationCap,
    card: "bg-rose-50 ring-rose-200 hover:ring-rose-300",
    iconWrap: "bg-linear-to-br from-brand-red to-rose-600",
    rail: "from-brand-red to-rose-500",
  },
  {
    key: "trainers",
    title: "Capacitadores",
    detail: "Publica la matriz, las salas y el control de vigencia.",
    hrefKey: "admin" as const,
    icon: Shield,
    card: "bg-sky-50 ring-sky-200 hover:ring-sky-300",
    iconWrap: "bg-linear-to-br from-sky-500 to-teal-500",
    rail: "from-sky-500 to-teal-500",
  },
  {
    key: "progress",
    title: "Progreso",
    detail: "Representante de la empresa. Solo consulta el cumplimiento del campus.",
    hrefKey: "progress" as const,
    icon: BarChart3,
    card: "bg-amber-50 ring-amber-200 hover:ring-amber-300",
    iconWrap: "bg-linear-to-br from-amber-500 to-orange-500",
    rail: "from-amber-400 to-orange-500",
  },
];

export function CampusGate({ studentLoginHref }: Props) {
  const hrefs = {
    student: studentLoginHref,
    admin: "/capacitacion/admin/login",
    progress: "/capacitacion/admin/progreso/login",
  };

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.figure
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-[22rem] overflow-hidden rounded-3xl ring-1 ring-slate-200/80 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.4)] lg:min-h-full"
      >
        <Image
          src="/images/home1.jpg"
          alt="Aula digital sobre un teclado, metafora de formacion online"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="hero-kenburns object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-brand-navy/85 via-brand-navy/25 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
            Formacion digital
          </p>
          <p className="mt-2 max-w-sm font-display text-2xl font-semibold uppercase tracking-[0.04em] text-white">
            El aula y el campus en el mismo lugar
          </p>
        </figcaption>
      </motion.figure>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col"
      >
        <div className="mb-5">
          <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">
            Acceso privado
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.06em] text-ink sm:text-4xl">
            Campus de capacitacion
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            Capacitacion obligatoria por sector, puesto y tarea. El personal cursa lo asignado; el capacitador publica la matriz; el representante de la empresa consulta el progreso.
          </p>
        </div>

        <div className="grid flex-1 gap-3">
          {MODULES.map((item) => {
            const href = hrefs[item.hrefKey];
            const Icon = item.icon;
            if (!href) {
              return (
                <div key={item.key} className={`rounded-2xl px-5 py-5 ring-1 ${item.card}`}>
                  <p className="font-display text-lg font-semibold uppercase tracking-[0.06em] text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">Falta configurar la clave de acceso del campus.</p>
                </div>
              );
            }
            return (
              <Link
                key={item.key}
                href={href}
                className={`group relative overflow-hidden rounded-2xl px-5 py-5 ring-1 shadow-sm transition-transform hover:-translate-y-0.5 ${item.card}`}
              >
                <span className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${item.rail}`} />
                <span className="flex items-start gap-4">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md ${item.iconWrap}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-semibold uppercase tracking-[0.06em] text-ink">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-muted">{item.detail}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-red" />
                </span>
              </Link>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
