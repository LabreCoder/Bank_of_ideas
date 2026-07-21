import { useMemo } from "react";
import StatCard from "../StatCard";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function SimpleRadarChart({ categories, ideas }) {
  const data = useMemo(() => {
    return categories.map((category) => ({
      name: category.name,
      value: ideas.filter((idea) => idea.category.id === category.id).length,
    }));
  }, [categories, ideas]);

  
  return (
    <StatCard title="Categories" maxWidth="max-w-[50vw]">
      <div className="w-full h-[300px] sm:h-[350px] flex items-center justify-center ">
        <RadarChart
          style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }}
          outerRadius="80%"
          data={data}
          margin={{ top: 20, left: 20, right: 20, bottom: 20 }}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis domain={[0, 'dataMax']} allowDecimals={false} />
          <Radar name="Ideias" dataKey="value" className="stroke-accent-500 fill-accent-500" fillOpacity={0.6} />
        </RadarChart>
      </div>
    </StatCard>
  );
}