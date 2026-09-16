import { useEffect, useId, useRef, useState } from "react";
import api from "../../services/api";

const inputClass = "w-full rounded-lg border border-white/10 bg-[#123E35] px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#EFD391]/60 focus:outline-none";

export default function PropertyContactField({ value, onChange, autoFillCurrent = false }) {
  const id = useId();
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [defaults, setDefaults] = useState("");
  const edited = useRef(false);
  const current = useRef({ value, onChange });
  useEffect(() => { current.current = { value, onChange }; }, [value, onChange]);
  useEffect(() => {
    let cancelled = false;
    api.get("/admin/current-contact").then(({ data }) => {
      if (cancelled) return;
      const phones = data.phoneNumbers.join("\n");
      setDefaults(phones);
      setLoadError(false);
      if (!edited.current && (autoFillCurrent || !current.current.value)) {
        current.current.onChange({ target: { name: "contactInfo", value: phones } });
      }
    }).catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, [autoFillCurrent, reload]);
  const update = (next) => {
    edited.current = true;
    onChange({ target: { name: "contactInfo", value: next } });
  };
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider text-white/50">Numrat e kontaktit</label>
      <textarea id={id} name="contactInfo" value={value ?? ""} onChange={(event) => update(event.target.value)}
        rows={3} maxLength={255} aria-describedby={`${id}-help`} className={`${inputClass} resize-y`} placeholder="+383..." />
      <p id={`${id}-help`} className="text-xs text-white/50">Numrat plotësohen nga profili yt. Mund t’i ndryshosh ose të shtosh numra të tjerë, secilin në rresht të ri.</p>
      {defaults && !autoFillCurrent && <button type="button" onClick={() => update(defaults)} className="text-xs text-[#EFD391] underline">Përdor numrat e mi</button>}
      {loadError && <p role="alert" className="text-xs text-red-300">Numri nuk u ngarkua. Plotësoje manualisht ose <button type="button" className="underline" onClick={() => setReload((count) => count + 1)}>provo përsëri</button>.</p>}
    </div>
  );
}
