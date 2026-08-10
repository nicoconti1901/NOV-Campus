type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

/** Títulos legibles sobre el fondo fotográfico del campus/admin */
export function CapacitacionSectionHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3.5 shadow-md backdrop-blur-sm sm:px-5">
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-brand-gray">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
