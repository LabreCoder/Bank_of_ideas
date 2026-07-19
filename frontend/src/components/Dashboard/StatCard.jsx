export default function StatCard({ title, value, subtitle, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between gap-2">
      <p className="text-[18px] font-medium font-bold text-black-500 uppercase tracking-wide">{title}</p>
      <p className="text-[36px] font-semibold text-accent-500">{value}</p>
      {subtitle && <p className="text-[14px] text-gray-400">{subtitle}</p>}
      {children}
    </div>
  );
}