function StatsCard({ title, value, gradient }) {
    return (
      <div
        className="stats-card"
        style={{ background: gradient || "linear-gradient(135deg, #FFAE42, #FF7F50)" }}
      >
        <p className="stats-card-title">{title}</p>
        <p className="stats-card-value">{value}</p>
      </div>
    );
  }
  
  export default StatsCard;
  