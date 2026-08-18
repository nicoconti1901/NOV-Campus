type Props = {
  children: React.ReactNode;
};

export function CapacitacionBackground({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col bg-brand-navy">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(237,50,41,0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(97,102,110,0.16), transparent)",
        }}
        aria-hidden
      />
      {children}
    </div>
  );
}
