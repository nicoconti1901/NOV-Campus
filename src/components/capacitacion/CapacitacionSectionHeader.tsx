type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function CapacitacionSectionHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-white/80 p-7 ring-1 ring-slate-200/80 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-9">
      <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-navy via-brand-red to-teal-500" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.06em] text-ink sm:text-3xl">
            {title}
          </h2>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
