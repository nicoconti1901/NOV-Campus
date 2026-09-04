"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  HardHat,
  Presentation,
} from "lucide-react";
import {
  PERSONAL_OPTIONS,
  PROGRESS_OPTIONS,
  TRAINER_OPTIONS,
  type DemoModuleId,
  type DemoOption,
} from "@/lib/capacitacion/demo-options";

type Props = {
  studentLoginHref: string | null;
};

const MODULES: {
  id: DemoModuleId;
  number: string;
  title: string;
  subtitle: string;
  icon: typeof HardHat;
  accent: string;
  glow: string;
  bar: string;
  ring: string;
  hoverBtn: string;
}[] = [
  {
    id: "personal",
    number: "01",
    title: "Personal",
    subtitle: "Empleados que cursan salud, seguridad e higiene.",
    icon: HardHat,
    accent: "text-brand-red",
    glow: "rgba(237,50,41,0.22)",
    bar: "bg-brand-red-dark/80",
    ring: "ring-brand-red/40",
    hoverBtn: "group-hover:bg-brand-red group-hover:text-white",
  },
  {
    id: "capacitadores",
    number: "02",
    title: "Capacitadores",
    subtitle: "Quién arma salas, cursos y habilita al personal.",
    icon: Presentation,
    accent: "text-[#2ea8a0]",
    glow: "rgba(46,168,160,0.22)",
    bar: "bg-[#2ea8a0]",
    ring: "ring-[#2ea8a0]/40",
    hoverBtn: "group-hover:bg-[#2ea8a0] group-hover:text-[#0f1a1c]",
  },
  {
    id: "progreso",
    number: "03",
    title: "Progreso",
    subtitle: "Matrices de avance, sin entrar como personal ni capacitador.",
    icon: BarChart3,
    accent: "text-[#c9a227]",
    glow: "rgba(226,178,45,0.16)",
    bar: "bg-[#c9a227]",
    ring: "ring-[#e2b22d]/30",
    hoverBtn: "group-hover:bg-[#e2b22d] group-hover:text-[#10161e]",
  },
];

function optionsFor(id: DemoModuleId): DemoOption[] {
  if (id === "personal") return PERSONAL_OPTIONS;
  if (id === "capacitadores") return TRAINER_OPTIONS;
  return PROGRESS_OPTIONS;
}

function liveHrefFor(moduleId: DemoModuleId, option: DemoOption, studentLoginHref: string | null) {
  if (moduleId === "personal" && option.id === "dni") return studentLoginHref;
  return option.liveHref ?? null;
}

export function CampusDemoModules({ studentLoginHref }: Props) {
  const [openModule, setOpenModule] = useState<DemoModuleId | null>(null);
  const [openOption, setOpenOption] = useState<string | null>(null);

  function toggleModule(id: DemoModuleId) {
    setOpenModule((current) => (current === id ? null : id));
    setOpenOption(null);
  }

  return (
    <div className="flex flex-col justify-center gap-4">
      <p className="px-1 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
        Elegí un módulo y desglosá las opciones
      </p>

      {MODULES.map((mod) => {
        const Icon = mod.icon;
        const expanded = openModule === mod.id;
        const options = optionsFor(mod.id);

        return (
          <article
            key={mod.id}
            className={`overflow-hidden rounded-3xl border border-white/[0.08] backdrop-blur-xl ${
              mod.id === "personal"
                ? "bg-[#1a1212]/90"
                : mod.id === "capacitadores"
                  ? "bg-[#0f1a1c]/92"
                  : "bg-[#10161e]/92"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="group relative block w-full overflow-hidden p-6 text-left"
              aria-expanded={expanded}
            >
              {mod.id !== "progreso" ? (
                <span className={`absolute inset-y-0 left-0 w-[3px] ${mod.bar}`} />
              ) : null}
              <span
                className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full"
                style={{ background: `radial-gradient(circle, ${mod.glow}, transparent 68%)` }}
              />
              {mod.id === "progreso" ? (
                <span
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px)",
                    backgroundSize: "28px 100%",
                  }}
                />
              ) : null}

              <div className="relative flex items-start justify-between gap-3 pl-1">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/40 ${mod.accent} ring-1 ${mod.ring}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={`font-display text-[10px] font-semibold uppercase tracking-[0.2em] ${mod.accent}`}>
                      Módulo {mod.number}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold uppercase tracking-[0.08em] text-white">
                      {mod.title}
                    </h2>
                    <p className="mt-2 max-w-[18rem] text-sm leading-snug text-white/70">{mod.subtitle}</p>
                  </div>
                </div>
                <span
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/35 text-white ring-1 ${mod.ring} transition-colors ${mod.hoverBtn}`}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </span>
              </div>
            </button>

            {expanded ? (
              <div className="space-y-2 border-t border-white/10 px-4 pb-5 pt-3 sm:px-6">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Opciones de este módulo</p>
                {options.map((option) => {
                  const optionOpen = openOption === option.id;
                  const liveHref = liveHrefFor(mod.id, option, studentLoginHref);
                  const tryHref = liveHref ?? option.demoHref;

                  return (
                    <div key={option.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                      <button
                        type="button"
                        onClick={() => setOpenOption((current) => (current === option.id ? null : option.id))}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-white">
                              {option.title}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                option.badge === "Activo"
                                  ? "bg-white/10 text-white"
                                  : "bg-white/5 text-white/45"
                              }`}
                            >
                              {option.badge}
                            </span>
                          </span>
                          {!optionOpen ? (
                            <span className="mt-1 block text-xs text-white/50">{option.summary}</span>
                          ) : null}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${optionOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {optionOpen ? (
                        <div className="space-y-3 border-t border-white/10 px-4 py-4">
                          <p className="text-sm leading-relaxed text-white/70">{option.detail}</p>
                          {tryHref ? (
                            <Link
                              href={tryHref}
                              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
                                option.badge === "Activo" ? "bg-brand-red hover:bg-brand-red-dark" : "bg-white/10 hover:bg-white/15"
                              }`}
                            >
                              {option.badge === "Activo" ? "Probar esta vía" : "Ver la muestra"}
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          ) : (
                            <p className="text-xs text-white/45">
                              Configurá CAMPUS_ACCESS_KEY para probar el ingreso con DNI.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
