export function CampusHomeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-brand-navy" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 12%, rgba(237,50,41,0.22), transparent 58%), radial-gradient(ellipse 55% 40% at 100% 100%, rgba(97,102,110,0.28), transparent 55%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/55 via-transparent to-brand-black/80" />
    </div>
  );
}
