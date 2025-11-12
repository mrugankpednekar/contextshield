import { Card } from "@/components/ui/card";

interface KPIItem {
  label: string;
  value: string | number;
  helper?: string;
}

export function KpiCards({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">{item.label}</div>
          <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
          {item.helper && <div className="mt-1 text-xs text-white/50">{item.helper}</div>}
        </Card>
      ))}
    </div>
  );
}
