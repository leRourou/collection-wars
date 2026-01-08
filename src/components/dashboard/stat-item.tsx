interface StatItemProps {
  value: number | string;
  label: string;
}

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50">
      <p className="text-3xl font-bold text-primary mb-1">{value}</p>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
    </div>
  );
}
