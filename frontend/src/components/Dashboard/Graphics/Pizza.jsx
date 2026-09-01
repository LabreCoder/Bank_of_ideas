import { useMemo } from "react";
import StatCard from "../../Default/StatCard";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#E74C3C', '#F1C40F', '#2ECC71'];

function getCategoryColor(index, totalItems) {
    if (index < COLORS.length) {
        return COLORS[index];
    }

    // Fallback for extra categories: generate evenly spaced hues for visual distinction.
    const hue = Math.round((index / Math.max(totalItems, 1)) * 360);
    return `hsl(${hue}, 65%, 55%)`;
}

export default function PizzaGraphic({ categories, ideas }) {
    const stats = useMemo(() => {
        const categoriesIdeasCount = categories.reduce((acc, category) => {
            acc[category.id] = ideas.filter((idea) => idea.category.id === category.id).length;

            return acc;
        }, {});
        const data = categories
            .map((category) => ({
                name: category.name,
                value: categoriesIdeasCount[category.id] || 0,
            }))
            .filter((category) => category.value > 0);

        return { data, categoriesIdeasCount };
    }, [categories, ideas]);

    return (
        <StatCard title="Ideas distribution by category" variant="chart">
            <div className="w-full h-64 md:h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={stats.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    borderRadius={10}
                    outerRadius="80%" 
                    fill="#8884d8"
                    dataKey="value"
                    >
                    {stats.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(index, stats.data.length)} />
                    ))} 
                    </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: "10px",
                                border: "1px solid rgb(var(--color-ui-border) / 1)",
                                backgroundColor: "rgb(var(--color-ui-surface) / 1)",
                                color: "rgb(var(--color-ui-text-primary) / 1)",
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, color: "rgb(var(--color-ui-text-secondary) / 1)" }} />
                </PieChart>
                </ResponsiveContainer>
            </div>
        </StatCard>
    );
}
