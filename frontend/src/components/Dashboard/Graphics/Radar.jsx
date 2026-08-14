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
    <StatCard title="Category intensity">
      <div className="w-full h-64 md:h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius="78%" data={data} margin={{ top: 20, left: 20, right: 20, bottom: 20 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis domain={[0, "dataMax"]} allowDecimals={false} />
            <Radar name="Ideias" dataKey="value" className="stroke-accent-500 fill-accent-500" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </StatCard>
  );
}