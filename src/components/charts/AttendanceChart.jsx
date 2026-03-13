// src/components/charts/AttendanceChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AttendanceChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={240}>
    <BarChart data={data} barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--sub)" }} />
      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--sub)" }} domain={[0, 160]} />
      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
      <Bar dataKey="present" name="Present" fill="var(--text)"   radius={[4,4,0,0]} barSize={22} />
      <Bar dataKey="absent"  name="Absent"  fill="#d1d5db" radius={[4,4,0,0]} barSize={22} />
    </BarChart>
  </ResponsiveContainer>
);

export default AttendanceChart;
