export function CampusAtmosphere() {
  return (
    <div className="campus-atmosphere pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-paper" aria-hidden>
      <div className="campus-aurora" />
      <div className="campus-mesh absolute inset-0 opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(238,242,247,0.55)_48%,rgba(238,242,247,0.82)_100%)]" />
    </div>
  );
}
