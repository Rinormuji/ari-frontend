const SoldStamp = ({ compact = false, rented = false }) => (
  <svg
    viewBox="0 0 200 200"
    role="img"
    aria-label={rented ? "E lëshuar me qera" : "E shitur"}
    className={`pointer-events-none block shrink-0 -rotate-8 overflow-visible text-[#cf1526] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] ${compact ? "h-12 w-12" : "h-auto w-44 max-w-[56%]"}`}
  >
    <g fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="87" strokeWidth="5" />
      <circle cx="100" cy="100" r="79" strokeWidth="2" opacity="0.9" />
      {!compact && (
        <>
          <path d="M68 78h64M68 123h64" strokeWidth="2.5" />
          <path d="m100 150 3 3-3 3-3-3Z" fill="currentColor" stroke="none" />
        </>
      )}
    </g>
    <g aria-hidden="true" fill="currentColor" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif">
      {!compact && (
        <text x="100" y="64" fontSize="12" fontWeight="800" letterSpacing="4">
          ARI
        </text>
      )}
      {rented ? (
        <text x="100" fontSize="19" fontWeight="900" letterSpacing="1" stroke="currentColor" strokeWidth="0.45" paintOrder="stroke">
          <tspan x="100" y="98">E LËSHUAR</tspan>
          <tspan x="100" y="117">ME QERA</tspan>
        </text>
      ) : (
        <text x="100" y="110" fontSize="27" fontWeight="900" letterSpacing="1" stroke="currentColor" strokeWidth="0.45" paintOrder="stroke">
          E SHITUR
        </text>
      )}
      {!compact && (
        <text x="100" y="141" fontSize="9" fontWeight="800" letterSpacing="2">
          REAL ESTATE
        </text>
      )}
    </g>
  </svg>
);

export default SoldStamp;
