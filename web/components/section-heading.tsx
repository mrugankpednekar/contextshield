interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const base =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left";
  return (
    <div className={base}>
      <p className="text-[11px] uppercase tracking-[0.5em] text-emerald-300/80">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-2 text-base text-white/70 md:text-lg">{description}</p>}
    </div>
  );
}
