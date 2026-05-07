function StatsCard({ title, value }) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-5 flex flex-col gap-2">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-white">{value ?? "—"}</p>
    </div>
  );
}

export default StatsCard;
