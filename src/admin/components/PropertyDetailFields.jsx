import { Check, SlidersHorizontal } from "lucide-react";
import { getDetailFields } from "../../utils/propertyDetails";

const inputCls = "mt-2 h-11 w-full rounded-xl border border-white/15 bg-[#0D342D] px-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#EFD391] focus:ring-2 focus:ring-[#EFD391]/15";

export default function PropertyDetailFields({ type, details = {}, onChange }) {
  const fields = getDetailFields(type);
  if (!fields.length) return null;

  const choiceFields = fields.filter((field) => field.kind === "select" || field.kind === "text");
  const numberFields = fields.filter((field) => field.kind === "number");
  const booleanFields = fields.filter((field) => field.kind === "boolean");
  const update = (key, value) => onChange({ ...details, [key]: value });

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#10382F] shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
      <div className="flex items-start gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFD391]/15 text-[#EFD391]">
          <SlidersHorizontal size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-white">Kategori shtesë</h2>
          <p className="mt-0.5 text-xs text-white/50">Plotëso detajet që vlejnë për këtë pronë.</p>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
        {choiceFields.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#EFD391]">Informacioni i pronës</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {choiceFields.map((field) => (
                <label key={field.key} className="block text-sm font-medium text-white/80">
                  {field.label}
                  {field.kind === "select" ? (
                    <select value={details[field.key] || ""} onChange={(event) => update(field.key, event.target.value)} className={inputCls}>
                      <option value="">Zgjidh...</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={details[field.key] ?? ""} placeholder={field.placeholder || "Shkruaj këtu"}
                      onChange={(event) => update(field.key, event.target.value)} className={inputCls} />
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {numberFields.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#EFD391]">Numri i hapësirave</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {numberFields.map((field) => (
                <label key={field.key} className="block text-sm font-medium text-white/80">
                  {field.label}
                  <input type="number" min="0" step="1" inputMode="numeric" value={details[field.key] ?? ""} placeholder="0"
                    onChange={(event) => update(field.key, event.target.value === "" ? "" : Number(event.target.value))}
                    className={inputCls} />
                </label>
              ))}
            </div>
          </div>
        )}

        {booleanFields.length > 0 && (
          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#EFD391]">Opsionet e pronës</legend>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {booleanFields.map((field) => {
                const selected = details[field.key] === true;
                return (
                  <label key={field.key} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-[#EFD391] ${selected ? "border-[#EFD391]/55 bg-[#EFD391]/10 text-white" : "border-white/10 bg-white/[0.035] text-white/70 hover:border-white/25 hover:bg-white/[0.06]"}`}>
                    <input type="checkbox" checked={selected} onChange={(event) => update(field.key, event.target.checked)} className="sr-only" />
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-[#EFD391] bg-[#EFD391] text-[#10382F]" : "border-white/35 bg-transparent"}`}>
                      {selected && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="flex-1">{field.label}</span>
                    <span className={`text-xs font-medium ${selected ? "text-[#EFD391]" : "text-white/35"}`}>{selected ? "Po" : "Jo"}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </div>
    </section>
  );
}
