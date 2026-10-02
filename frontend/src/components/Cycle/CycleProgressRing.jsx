export default function CycleProgressRing({ percentage, size = 110 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isComplete = percentage >= 100;

  return (
    <div
      className="relative inline-flex items-center justify-center mb-2"
      style={{ width: size, height: size }}
    >
      {/* -rotate-90: SVG começa o traço às 3h por padrão; giramos pra
          começar às 12h, que é a leitura visual esperada de um "progresso". */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-gray-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={isComplete ? "stroke-emerald-500" : "stroke-accent-600"}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <span className="absolute text-xl font-semibold text-gray-900">{percentage}%</span>
    </div>
  );
}
