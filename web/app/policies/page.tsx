"use client";

import { useEffect, useState } from "react";
import { PolicyEditor } from "@/components/editor-policy";
import { SectionHeading } from "@/components/section-heading";
import { BackgroundGrid } from "@/components/ui/background-grid";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function PoliciesPage() {
  const [yaml, setYaml] = useState("loading policy…");
  const [tenant] = useState("demo");

  useEffect(() => {
    const endpoint = API ? `${API}/v1/policy/${tenant}` : `/api/policy/${tenant}`;
    fetch(endpoint)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setYaml(data.yaml))
      .catch(() => setYaml("tenant_id: demo\nmode: observe"));
  }, [tenant]);

  if (!yaml) return null;

  return (
    <div className="space-y-8">
      <BackgroundGrid className="px-6 py-8">
        <SectionHeading
          eyebrow="Policies"
          title="YAML-powered detection + enforcement per tenant."
          description="Toggle observe/enforce, plug in Presidio, dial entropy thresholds, and decide how to mask, tokenize, or drop every signal."
        />
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/70">
          {["Presets", "NER", "Entropy", "Custom dictionaries", "Response controls"].map((pill) => (
            <span key={pill} className="rounded-full border border-white/15 px-3 py-1">
              {pill}
            </span>
          ))}
        </div>
      </BackgroundGrid>
      <PolicyEditor
        tenant={tenant}
        initialYaml={yaml}
        onValidate={async (body) => {
          const endpoint = API ? `${API}/v1/policy/${tenant}/validate` : `/api/policy/${tenant}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yaml: body }),
          });
          if (!res.ok) throw new Error(await res.text());
        }}
        onActivate={async (body) => {
          const endpoint = API ? `${API}/v1/policy/${tenant}/activate` : `/api/policy/${tenant}`;
          const res = await fetch(endpoint, {
            method: API ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yaml: body }),
          });
          if (!res.ok) throw new Error(await res.text());
        }}
      />
    </div>
  );
}
