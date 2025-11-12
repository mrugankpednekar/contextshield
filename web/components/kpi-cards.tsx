interface KPIItem {
  label: string;
  value: string | number;
  helper?: string;
}

export function KpiCards({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_15px_60px_rgba(15,23,42,0.45)]"
        >
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/50">{item.label}</div>
          <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
          {item.helper && <div className="mt-1 text-xs text-white/50">{item.helper}</div>}
        </div>
      ))}
    </div>
  );
}
