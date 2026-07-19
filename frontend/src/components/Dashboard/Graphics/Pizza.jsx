import { useMemo } from "react";
import StatCard from "../StatCard";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#E74C3C', '#F1C40F', '#2ECC71'];

export default function PizzaGraphic({ categories, ideas }) {
    const stats = useMemo(() => {
        const categoriesIdeasCount = categories.reduce((acc, category) => {
            console.log(`Category: ${category.name}, Ideas Count: ${ideas.filter((idea) => idea.category.id === category.id).length}`); // Debugging line
            acc[category.id] = ideas.filter((idea) => idea.category.id === category.id).length;
            return acc;
        }, {});
        const data = categories.map((category) => {
            const name = category.name;
            return {
                name,
                value: categoriesIdeasCount[category.id] = categoriesIdeasCount[category.id] ? categoriesIdeasCount[category.id] : 0, // Use ideas_count or default to 0
            };
        });
        return { data, categoriesIdeasCount };
    }, [categories, ideas]);

    console.log("PizzaGraphic stats:", stats); // Debugging line

    return (
        <StatCard title="Categories" >
            <PieChart style={{ width: '100%', maxWidth: '200px', height: '100%', maxHeight: '200px' }} >
                <Pie
                    data={stats.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    //label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    borderRadius={10}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {stats.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))} 
                </Pie>
                    <Tooltip />
                    <Legend />
            </PieChart>
        </StatCard>
    );
}
