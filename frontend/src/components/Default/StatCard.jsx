export default function StatCard({
  title,
  value,
  subtitle,
  children,
  variant = "secondary",
  maxWidth = "",
  valueClassName = "",
}) {
  const variantClasses = {
    primary: "bg-white border-accent-200 shadow-sm",
    secondary: "bg-white border-gray-200",
    chart: "bg-white border-gray-200",
    operational: "bg-white border-gray-200",
  };

  const valueClasses = {
    primary: "text-[32px] md:text-[40px] text-accent-600",
    secondary: "text-[28px] md:text-[32px] text-accent-500",
    chart: "text-[24px] md:text-[28px] text-accent-500",
    operational: "text-[24px] md:text-[28px] text-accent-500",
  };

  return (
    <section
      className={`rounded-xl border p-4 md:p-5 flex flex-col justify-between gap-3 w-full ${
        variantClasses[variant] || variantClasses.secondary
      } ${maxWidth}`}
    >
      <p className="text-sm font-semibold text-ui-text-secondary tracking-wide">{title}</p>
      {value !== undefined && value !== null && value !== "" && (
        <p
          className={`font-semibold leading-tight ${
            valueClasses[variant] || valueClasses.secondary
          } ${valueClassName}`}
        >
          {value}
        </p>
      )}
      {subtitle && <p className="text-sm text-ui-text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}