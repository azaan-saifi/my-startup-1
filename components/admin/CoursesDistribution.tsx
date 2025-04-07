import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Sample data - this would come from API in a real application
const data = [
  { name: "Web Development", value: 35, color: "#f0bb1c" },
  { name: "Mobile Development", value: 25, color: "#3a86ff" },
  { name: "Data Science", value: 20, color: "#ff006e" },
  { name: "Cybersecurity", value: 15, color: "#8338ec" },
  { name: "UI/UX Design", value: 5, color: "#38b000" },
];

const COLORS = data.map(item => item.color);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border border-zinc-800 bg-black/90 p-3 shadow-md backdrop-blur-sm">
        <p className="text-sm font-medium text-white">{data.name}</p>
        <div className="mt-1 flex items-center text-xs">
          <span className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: data.color }}></span>
          <span className="text-zinc-400">Courses:</span>
          <span className="ml-1 font-medium text-white">{data.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const CoursesDistribution = () => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="mb-6">
        <h3 className="text-xl font-medium text-white">Course Categories</h3>
        <p className="mt-1 text-sm text-zinc-400">Distribution by course type</p>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ 
                paddingTop: 20, 
                fontSize: 12,
                width: '100%',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CoursesDistribution; 