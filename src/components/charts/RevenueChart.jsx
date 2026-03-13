// src/components/charts/RevenueChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const RevenueChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--sub)" }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--sub)" }} tickFormatter={(v) => `$${v / 1000}k`} />
      <Tooltip formatter={(v) => [`$${v.toLocaleString()}`]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
      <Bar dataKey="revenue"  name="Revenue"  fill="var(--text)"   radius={[4,4,0,0]} barSize={18} />
      <Bar dataKey="expenses" name="Expenses" fill="var(--border)" radius={[4,4,0,0]} barSize={18} />
    </BarChart>
  </ResponsiveContainer>
);

export default RevenueChart;
