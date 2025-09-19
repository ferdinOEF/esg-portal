// components/schemes/FilterPanel.tsx
"use client";

export default function FilterPanel(props: {
  allCategories: string[];
  allTags: string[];
  activeCats: string[];
  activeTags: string[];
  mandatory: "all" | "true" | "false";
  onToggleCat: (c: string) => void;
  onToggleTag: (t: string) => void;
  onMandatory: (v: "all" | "true" | "false") => void;
  onClear: () => void;
}) {
  const {
    allCategories, allTags, activeCats, activeTags, mandatory,
    onToggleCat, onToggleTag, onMandatory, onClear
  } = props;

  return (
    <div className="border rounded-xl p-4 bg-white space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Refine</h3>
        <button onClick={onClear} className="text-xs underline">Clear all</button>
      </div>

      <div>
        <label className="text-xs text-gray-600">Mandatory</label>
        <select
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={mandatory}
          onChange={(e) => onMandatory(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="true">Mandatory</option>
          <option value="false">Voluntary</option>
        </select>
      </div>

      <div>
        <div className="text-xs text-gray-600 mb-1">Categories</div>
        <div className="flex flex-col gap-1 max-h-64 overflow-auto pr-1">
          {allCategories.map((c) => {
            const checked = activeCats.includes(c);
            return (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCat(c)}
                  className="h-4 w-4"
                />
                <span className={checked ? "font-medium" : ""}>{c}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-600 mb-1">Tags</div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
          {allTags.map((t) => {
            const active = activeTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => onToggleTag(t)}
                className={`text-xs px-2 py-1 rounded-full border ${active ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-50"}`}
              >
                #{t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
