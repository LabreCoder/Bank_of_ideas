import { useMemo } from "react";
import StatCard from "../../StatCard";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

    return (
        <StatCard title="Categories" maxWidth="max-w-[50vw]">
            {/* Definimos uma altura fixa ou proporcional para o container do gráfico */}
            <div className="w-full h-[300px] sm:h-[350px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={stats.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    borderRadius={10}
                    //label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} 
                    // Mudamos de 150 para uma porcentagem (ex: 70% ou 80%) para ele ser responsivo
                    outerRadius="80%" 
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
                </ResponsiveContainer>
            </div>
        </StatCard>
    );
}
