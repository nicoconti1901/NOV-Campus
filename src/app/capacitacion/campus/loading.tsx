export default function CampusLoading() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-white/80 ring-1 ring-slate-200/80">
        <div className="px-5 py-6 sm:px-7">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-paper-muted" />
        </div>
        <div className="grid border-t border-slate-200/80 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse bg-paper-muted/70" />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/80" />
        ))}
      </div>
      <p className="text-sm text-ink-muted">Cargando tus capacitaciones asignadas...</p>
    </div>
  );
}
