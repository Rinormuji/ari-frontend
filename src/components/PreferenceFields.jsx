import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cityAPI } from '../services/api';
import { getTypeLabel } from '../utils/propertyLabels';

const types = ['BANESA', 'SHTEPI', 'TOKA', 'LOKALE', 'ZYRE', 'DEPO', 'OBJEKT', 'VILLE', 'INVENTAR'];
const statuses = [{ value: 'FOR_SALE', label: 'Blerje' }, { value: 'FOR_RENT', label: 'Me qira' }];

function MultiChoice({ label, options, selected, onChange, getLabel, fieldClass, dark }) {
  const [open, setOpen] = useState(false);
  const toggle = option => onChange(selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option]);
  return <div className="relative">
    <span className="block text-xs font-semibold">{label}</span>
    <button type="button" onClick={() => setOpen(value => !value)} className={`${fieldClass} mt-1 flex min-h-[44px] items-center justify-between gap-2 text-left`} aria-expanded={open}>
      <span className="flex flex-wrap gap-1.5">
        {selected.length ? selected.map(option => <span key={option} className="inline-flex items-center rounded-full bg-[#EFD391]/25 px-2 py-0.5 text-[11px] font-semibold">{getLabel(option)}</span>) : <span className="opacity-60">Zgjidhni {label.toLowerCase()}</span>}
      </span><ChevronDown size={16} className={`shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
    {open && <div className={`absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border p-1 shadow-xl ${dark ? 'border-white/15 bg-[#174d3f]' : 'border-gray-200 bg-white'}`}>
      {options.map(option => <label key={option} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#EFD391]/15">
        <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} className="accent-[#0F4638]" />{getLabel(option)}
      </label>)}
      {selected.length > 0 && <button type="button" onClick={() => onChange([])} className="w-full border-t px-3 py-2 text-left text-xs font-semibold opacity-70 hover:opacity-100">Pastro zgjedhjet</button>}
    </div>}
  </div>;
}

export default function PreferenceFields({ value, onChange, dark = false }) {
  const [cities, setCities] = useState([]);
  useEffect(() => { cityAPI.getAll().then(response => setCities(response.data || [])).catch(() => setCities([])); }, []);
  const fieldClass = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#D9BF7B] ${dark ? 'border-white/15 bg-[#174d3f] text-white' : 'border-gray-200 bg-white text-[#173e34]'}`;
  const update = (field, next) => onChange({ ...value, [field]: next });
  return (
    <fieldset className={`space-y-3 rounded-2xl border p-4 ${dark ? 'border-white/15 text-white' : 'border-gray-200 text-[#173e34]'}`}>
      <legend className="px-2 text-sm font-bold">Preferencat e pronës</legend>
      <p className={`text-xs ${dark ? 'text-white/65' : 'text-gray-600'}`}>Zgjidhni kriteret që ju interesojnë. Fushat mund të lihen bosh nëse jeni fleksibël.</p>
      <MultiChoice label="Qytetet" options={cities} selected={value.locations || []} onChange={next => update('locations', next)} getLabel={value => value} fieldClass={fieldClass} dark={dark} />
      <div className="grid grid-cols-2 gap-3">
        <MultiChoice label="Llojet" options={types} selected={value.types || []} onChange={next => update('types', next)} getLabel={getTypeLabel} fieldClass={fieldClass} dark={dark} />
        <label className="block text-xs font-semibold">Qëllimi
          <span className="relative mt-1 block">
            <select className={`${fieldClass} appearance-none pr-10`} value={value.status || ''} onChange={e => update('status', e.target.value)}>
              <option value="">Blerje dhe me qira</option>{statuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60" aria-hidden="true" />
          </span>
        </label>
        <label className="block text-xs font-semibold">Çmimi i përafërt (€)
          <input className={`${fieldClass} mt-1`} type="number" min="1" step="1" placeholder="±10.000 €" value={value.targetPrice ?? ''} onChange={e => update('targetPrice', e.target.value)} />
          <span className="mt-1 block text-[11px] font-normal opacity-60">Kërkimi bëhet ±10.000 €</span>
        </label>
        <label className="block text-xs font-semibold">Sipërfaqja e përafërt (m²)
          <input className={`${fieldClass} mt-1`} type="number" min="1" step="1" placeholder="±10 m²" value={value.targetArea ?? ''} onChange={e => update('targetArea', e.target.value)} />
          <span className="mt-1 block text-[11px] font-normal opacity-60">Kërkimi bëhet ±10 m²</span>
        </label>
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-xs leading-5">
        <input type="checkbox" className="mt-1 accent-[#0F4638]" checked={!!value.emailAlerts} onChange={e => update('emailAlerts', e.target.checked)} />
        <span>Dëshiroj të marr email për prona të reja që përputhen me këto preferenca dhe për përditësimet e pronave të mia favorite. Mund ta çaktivizoj kurdo.</span>
      </label>
    </fieldset>
  );
}
