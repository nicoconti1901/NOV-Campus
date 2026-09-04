type Props = {
  children: React.ReactNode;
};

export function CapacitacionBackground({ children }: Props) {
  return <div className="relative flex min-h-screen flex-col">{children}</div>;
}
