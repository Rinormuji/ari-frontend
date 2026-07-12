const toneClasses = {
  gold: "border-[#EFD391]/25 bg-[#EFD391]/10 text-[#EFD391]",
  green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  red: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  blue: "border-sky-400/20 bg-sky-400/10 text-sky-300",
};

function StatsCard({ title, value, subtitle, icon: Icon, tone = "gold" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F4638] p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value ?? "-"}</p>
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${toneClasses[tone] || toneClasses.gold}`}>
            <Icon size={20} />
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-white/45">{subtitle}</p>}
    </div>
  );
}

export default StatsCard;
