import logoMark from "../assets/images/ari-mark.svg";

const sizes = {
  sm: {
    wrap: "gap-2",
    badge: "h-11 w-11",
    image: "h-7 w-7",
    title: "text-[13px]",
    subtitle: "text-[10px]",
  },
  md: {
    wrap: "gap-3",
    badge: "h-14 w-14",
    image: "h-9 w-9",
    title: "text-[15px]",
    subtitle: "text-[11px]",
  },
  lg: {
    wrap: "gap-3",
    badge: "h-16 w-16",
    image: "h-11 w-11",
    title: "text-lg",
    subtitle: "text-xs",
  },
  xl: {
    wrap: "gap-4",
    badge: "h-24 w-24",
    image: "h-16 w-16",
    title: "text-2xl",
    subtitle: "text-sm",
  },
};

export default function BrandLogo({ size = "md", showText = true, stacked = false, className = "" }) {
  const s = sizes[size] ?? sizes.md;

  return (
    <div className={`group ${stacked ? "flex w-full flex-col items-center justify-center text-center" : `inline-flex items-center ${s.wrap}`} ${className}`}>
      <span
        className={`
          relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg
          border border-[#EFD391]/45 bg-[#0B332B]
          shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]
          transition-transform duration-300 group-hover:-translate-y-0.5
          ${s.badge}
        `}
      >
        <span className="absolute inset-[5px] rounded-md border border-[#EFD391]/15" />
        <span className="absolute -right-5 -top-5 h-12 w-12 rounded-full bg-[#EFD391]/12 blur-xl" />
        <img src={logoMark} alt="Ari Real Estate" className={`relative ${s.image}`} />
      </span>

      {showText && (
        <span className={stacked ? "mt-3 leading-none" : "leading-none"}>
          <span className={`block font-semibold uppercase text-[#F5D98E] ${s.title}`}>ARI</span>
          <span className={`mt-1 block font-medium uppercase text-[#E8E1D2]/65 ${s.subtitle}`}>Real Estate</span>
        </span>
      )}
    </div>
  );
}
