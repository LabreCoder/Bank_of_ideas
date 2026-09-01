import { useMemo } from "react";
import StatCard from "../../Default/StatCard";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export default function SimpleRadarChart({ categories, ideas }) {
  const data = useMemo(() => {
    return categories.map((category) => ({
      name: category.name,
      value: ideas.filter((idea) => idea.category.id === category.id).length,
    }));
  }, [categories, ideas]);

  
  return (
    <StatCard title="Category concentration" variant="chart">
      <div className="w-full h-64 md:h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius="78%" data={data} margin={{ top: 20, left: 20, right: 20, bottom: 20 }}>
            <PolarGrid stroke="rgb(var(--color-ui-border) / 1)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: "rgb(var(--color-ui-text-secondary) / 1)", fontSize: 11 }} />
            <PolarRadiusAxis
              domain={[0, "dataMax"]}
              allowDecimals={false}
              tick={{ fill: "rgb(var(--color-ui-text-muted) / 1)", fontSize: 11 }}
            />
            <Radar
              name="Ideas"
              dataKey="value"
              stroke="rgb(var(--color-accent-500) / 1)"
              fill="rgb(var(--color-accent-500) / 1)"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </StatCard>
  );
}