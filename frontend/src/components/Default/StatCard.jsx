export default function StatCard({
  title,
  value,
  subtitle,
  children,
  maxWidth = "",
  valueClassName = "",
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between gap-2 w-full ${maxWidth}`}>
      <p className="text-[18px] font-medium font-bold text-black-500 uppercase tracking-wide">{title}</p>
      {value !== undefined && value !== null && value !== "" && (
        <p className={`text-[32px] md:text-[36px] font-semibold text-accent-500 ${valueClassName}`}>{value}</p>
      )}
      {subtitle && <p className="text-[14px] text-gray-400">{subtitle}</p>}
      {children}
    </div>
  );
}