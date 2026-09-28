export default function PublicHero({ eyebrow, title, description, children }) {
  return (
    <section className="relative flex min-h-[342px] items-center justify-center overflow-hidden bg-[#0F4638] px-5 py-14 text-center text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[#EFD391]/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full border border-[#EFD391]/15" />
      <div className="relative mx-auto max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EFD391]">{eyebrow}</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{description}</p>
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
