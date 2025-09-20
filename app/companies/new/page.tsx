// app/companies/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  name: string;
  industry: string;
  employees?: number | null;
  revenueBand?: string | null;
  export: boolean;
  exportRegions: string[];
  tags: string[];
};

export default function NewCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    industry: "",
    employees: undefined,
    revenueBand: "",
    export: false,
    exportRegions: [],
    tags: [],
  });
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleToggleRegion = (r: string) => {
    setForm((f) => ({
      ...f,
      exportRegions: f.exportRegions.includes(r)
        ? f.exportRegions.filter((x) => x !== r)
        : [...f.exportRegions, r],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setPending(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      router.push("/companies");
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6 text-[color:var(--text-1)]">Add New Company</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-[color:var(--border-1)] bg-[color:var(--glass)] p-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Industry</label>
            <input
              type="text"
              className="w-full rounded-lg border border-[color:var(--border-1)] bg-[color:var(--glass)] p-2"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              placeholder="e.g., Food processing"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Employees (approx)</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-[color:var(--border-1)] bg-[color:var(--glass)] p-2"
              value={form.employees ?? ""}
              onChange={(e) => setForm({ ...form, employees: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Revenue band</label>
            <input
              type="text"
              className="w-full rounded-lg border border-[color:var(--border-1)] bg-[color:var(--glass)] p-2"
              value={form.revenueBand ?? ""}
              onChange={(e) => setForm({ ...form, revenueBand: e.target.value })}
              placeholder="e.g., ₹5–10cr"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="export"
              type="checkbox"
              checked={form.export}
              onChange={(e) => setForm({ ...form, export: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="export" className="text-sm">Exporter?</label>
          </div>
        </div>

        <div>
          <div className="text-sm mb-1">Export Regions</div>
          <div className="flex flex-wrap gap-2">
            {["EU", "UK", "US", "MENA", "APAC"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleToggleRegion(r)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  form.exportRegions.includes(r)
                    ? "bg-white/10 border-white/30"
                    : "bg-[color:var(--chip)] border-[color:var(--chip-border)] hover:bg-white/10"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm mb-1">Tags (quick flags)</div>
          <div className="flex flex-wrap gap-2">
            {["goa", "crz", "producer", "importer", "brandowner", "manufacturing", "cdp", "gri", "ifrs"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t],
                  }))
                }
                className={`text-xs px-2 py-1 rounded-full border ${
                  form.tags.includes(t)
                    ? "bg-white/10 border-white/30"
                    : "bg-[color:var(--chip)] border-[color:var(--chip-border)] hover:bg-white/10"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {err && <div className="text-sm text-red-400">{err}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-[color:var(--glass)] border border-[color:var(--border-1)] hover:shadow-glow disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
