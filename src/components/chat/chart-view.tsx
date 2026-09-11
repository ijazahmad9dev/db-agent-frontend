import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { Visualization } from "@/lib/types";

const PIE_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];

export function ChartView({ viz, rows }: { viz: Visualization; rows: Record<string, unknown>[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {viz.type === "bar" ? (
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={viz.x} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={viz.y} fill="#2563eb" />
          </BarChart>
        ) : viz.type === "line" ? (
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={viz.x} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={viz.y} stroke="#2563eb" />
          </LineChart>
        ) : viz.type === "area" ? (
          <AreaChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={viz.x} />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey={viz.y} stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
          </AreaChart>
        ) : viz.type === "scatter" ? (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={viz.x} name={viz.x} />
            <YAxis dataKey={viz.y} name={viz.y} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={rows} fill="#2563eb" />
          </ScatterChart>
        ) : (
          <PieChart>
            <Pie data={rows} dataKey={viz.y} nameKey={viz.x} cx="50%" cy="50%" outerRadius={80} label>
              {rows.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}