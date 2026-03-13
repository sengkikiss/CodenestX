// src/pages/Reports.jsx
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from "recharts";
import { Card, PageHeader, Btn } from "../components/ui/Form";
import api from "../services/api";

const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#3b82f6"];

const inp = {
  background: "var(--input)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "8px 12px", fontSize: 13,
  color: "var(--text)", outline: "none"
};
const lbl = {
  fontSize: 11, fontWeight: 700, color: "var(--sub)",
  textTransform: "uppercase", display: "block", marginBottom: 4
};

const StatBox = ({ label, value, sub, color = "#6366f1" }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", borderLeft: "4px solid " + color }}>
    <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>{value}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 2 }}>{sub}</div>}
  </div>
);

const TABS = ["Overview", "Attendance", "Payments"];

const ReportsPage = ({ students = [], teachers = [], courses = [], payments = [], role, user }) => {
  const [tab, setTab] = useState("Overview");

  // Attendance state
  const [attReport, setAttReport]   = useState([]);
  const [attSummary, setAttSummary] = useState([]);
  const [attCourse, setAttCourse]   = useState("");
  const [attDates, setAttDates]     = useState([]);
  const [selDate, setSelDate]       = useState(null);
  const [dateRecs, setDateRecs]     = useState([]);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);
  const [attLoading, setAttLoading] = useState(false);

  // Payment state
  const [payFilter, setPayFilter] = useState("all");
  const [paySearch, setPaySearch] = useState("");

  const myCourses = role === "Teacher"
    ? courses.filter(c => String(c.teacher_id) === String(user?.teacherId) || String(c.teacherId) === String(user?.teacherId))
    : courses;

  const loadAtt = async () => {
    setAttLoading(true);
    try {
      const p = new URLSearchParams({ from, to });
      if (attCourse) p.append("courseId", attCourse);
      const [rep, sum] = await Promise.all([
        api.get("/attendance/report?" + p),
        api.get("/attendance/summary?" + (attCourse ? "courseId=" + attCourse : ""))
      ]);
      setAttReport(rep.data);
      setAttSummary(sum.data);
    } catch (e) { console.error(e); }
    setAttLoading(false);
  };

  useEffect(() => { if (tab === "Attendance") loadAtt(); }, [tab, attCourse]);

  useEffect(() => {
    if (!attCourse) { setAttDates([]); setSelDate(null); setDateRecs([]); return; }
    api.get("/attendance/dates?courseId=" + attCourse).then(r => setAttDates(r.data)).catch(() => {});
  }, [attCourse]);

  const loadDateRecs = async (d) => {
    const dateStr = String(d).slice(0, 10);
    setSelDate(dateStr);
    try {
      const r = await api.get("/attendance/date-records?courseId=" + attCourse + "&date=" + dateStr);
      setDateRecs(r.data);
    } catch (e) { console.error(e); }
  };

  // Chart data
  const attChartData = attReport.slice(0, 14).reverse().map(r => ({
    date: String(r.date || "").slice(0, 10).slice(5),
    Present: Number(r.present || 0),
    Absent:  Number(r.absent  || 0),
    Late:    Number(r.late    || 0)
  }));
  const totalPresent = attReport.reduce((s, r) => s + Number(r.present || 0), 0);
  const totalAbsent  = attReport.reduce((s, r) => s + Number(r.absent  || 0), 0);
  const totalLate    = attReport.reduce((s, r) => s + Number(r.late    || 0), 0);
  const totalAtt     = totalPresent + totalAbsent + totalLate;
  const attRate      = totalAtt > 0 ? Math.round(totalPresent * 100 / totalAtt) : 0;

  const revByMonth = payments.reduce((acc, p) => {
    const m = (p.date || p.created_at || "").slice(0, 7);
    if (!m) return acc;
    acc[m] = (acc[m] || 0) + Number(p.amount || 0);
    return acc;
  }, {});
  const revData = Object.entries(revByMonth).slice(-8).map(([month, total]) => ({ month, total }));
  const courseData = myCourses.slice(0, 8).map(c => ({ name: (c.name || "N/A").slice(0, 14), students: Number(c.enrolledCount || 0) }));
  const gradeData = [
    { name: "A", value: students.filter(s => Number(s.gpa) >= 3.7).length || 4 },
    { name: "B", value: students.filter(s => Number(s.gpa) >= 3.0 && Number(s.gpa) < 3.7).length || 6 },
    { name: "C", value: students.filter(s => Number(s.gpa) >= 2.0 && Number(s.gpa) < 3.0).length || 3 },
    { name: "D", value: students.filter(s => Number(s.gpa) < 2.0).length || 2 },
  ].filter(d => d.value > 0);

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const paid   = payments.filter(p => p.status === "Paid");
  const unpaid = payments.filter(p => p.status === "Unpaid" || p.status === "Pending");
  const filteredPay = payments
    .filter(p => payFilter === "all" || (p.status || "").toLowerCase() === payFilter)
    .filter(p => (p.studentName || p.student_name || p.description || p.amount || "")
      .toString().toLowerCase().includes(paySearch.toLowerCase()));

  const STATUS_BG     = { Present: "#d1fae5", Absent: "#fee2e2", Late: "#fef3c7" };
  const STATUS_COLORS = { Present: "#10b981", Absent: "#ef4444", Late: "#f59e0b" };

  return (
    <div>
      <PageHeader title="Reports & Analytics" sub="School performance overview" />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "9px 22px", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer",
              fontWeight: 600, fontSize: 13,
              background: tab === t ? "var(--text)" : "var(--hover)",
              color: tab === t ? "var(--card)" : "var(--text)"
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "Overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
            {role !== "Teacher" && (
              <>
                <StatBox label="Total Students" value={students.length}  sub="Enrolled"  color="#6366f1" />
                <StatBox label="Total Teachers" value={teachers.length}  sub="On staff"  color="#10b981" />
                <StatBox label="Total Courses"  value={courses.length}   sub="Active"    color="#f59e0b" />
                <StatBox label="Total Revenue"  value={"$" + totalRevenue.toLocaleString()} sub="All time" color="#8b5cf6" />
              </>
            )}
            {role === "Teacher" && (
              <>
                <StatBox label="My Courses"  value={myCourses.length} sub="Assigned" color="#6366f1" />
                <StatBox label="My Students" value={myCourses.reduce((s, c) => s + Number(c.enrolledCount || 0), 0)} sub="Enrolled" color="#10b981" />
              </>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text)" }}>Students per Course</div>
              {courseData.length === 0
                ? <div style={{ textAlign: "center", padding: 32, color: "var(--sub)" }}>No courses yet</div>
                : <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={courseData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#6366f1" radius={[0,3,3,0]} />
                    </BarChart>
                  </ResponsiveContainer>
              }
            </Card>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text)" }}>Grade Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gradeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                    label={({ name, percent }) => name + " " + (percent * 100).toFixed(0) + "%"}>
                    {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {role === "Admin" && (
            <Card>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text)" }}>Monthly Revenue</div>
              {revData.length === 0
                ? <div style={{ textAlign: "center", padding: 32, color: "var(--sub)" }}>No payment data yet</div>
                : <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={revData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => "$" + v.toLocaleString()} />
                      <Bar dataKey="total" fill="#8b5cf6" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
              }
            </Card>
          )}
        </div>
      )}

      {/* ATTENDANCE */}
      {tab === "Attendance" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={lbl}>Course</label>
                <select value={attCourse} onChange={e => setAttCourse(e.target.value)} style={{ ...inp, minWidth: 180 }}>
                  <option value="">All Courses</option>
                  {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp} />
              </div>
              <Btn onClick={loadAtt} label={attLoading ? "Loading..." : "Apply Filter"} />
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
            <StatBox label="Attendance Rate" value={attRate + "%"} sub={totalPresent + " of " + totalAtt} color="#10b981" />
            <StatBox label="Present" value={totalPresent} sub="Days" color="#10b981" />
            <StatBox label="Absent"  value={totalAbsent}  sub="Days" color="#ef4444" />
            <StatBox label="Late"    value={totalLate}    sub="Days" color="#f59e0b" />
          </div>

          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text)" }}>Daily Attendance</div>
            {attChartData.length === 0
              ? <div style={{ textAlign: "center", padding: 32, color: "var(--sub)" }}>No attendance data in selected range</div>
              : <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={attChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Present" fill="#10b981" radius={[3,3,0,0]} />
                    <Bar dataKey="Absent"  fill="#ef4444" radius={[3,3,0,0]} />
                    <Bar dataKey="Late"    fill="#f59e0b" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </Card>

          {attCourse && (
            <div style={{ display: "grid", gridTemplateColumns: selDate ? "280px 1fr" : "280px", gap: 16, marginBottom: 20 }}>
              <Card p={0}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                  Sessions &mdash; {attDates.length} recorded
                </div>
                {attDates.length === 0 && (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--sub)", fontSize: 13 }}>No sessions recorded yet.</div>
                )}
                {attDates.map(d => (
                  <div key={d.date} onClick={() => loadDateRecs(d.date)}
                    style={{
                      padding: "11px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                      background: selDate === String(d.date).slice(0,10) ? "var(--hover)" : "transparent",
                      borderLeft: selDate === String(d.date).slice(0,10) ? "3px solid var(--text)" : "3px solid transparent"
                    }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{String(d.date).slice(0, 10)}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>Present {d.present}</span>
                      <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>Absent {d.absent}</span>
                      {Number(d.late) > 0 && <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>Late {d.late}</span>}
                    </div>
                  </div>
                ))}
              </Card>

              {selDate && (
                <Card p={0}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--text)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{selDate}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Present","Absent","Late"].map(s => (
                        <span key={s} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 99, background: STATUS_BG[s], color: STATUS_COLORS[s], fontWeight: 700 }}>
                          {s}: {dateRecs.filter(r => r.status === s).length}
                        </span>
                      ))}
                    </div>
                  </div>
                  {dateRecs.length === 0 && (
                    <div style={{ padding: 24, textAlign: "center", color: "var(--sub)", fontSize: 13 }}>No records found.</div>
                  )}
                  {dateRecs.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < dateRecs.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{r.name || (r.firstName + " " + r.lastName)}</div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 14px", borderRadius: 99, background: STATUS_BG[r.status], color: STATUS_COLORS[r.status] }}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}

          {attSummary.length > 0 && (
            <Card p={0}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                Student Attendance Summary
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--hover)" }}>
                    {["Student","Total","Present","Absent","Late","Rate"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attSummary.map((s, i) => (
                    <tr key={s.id} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--hover)" }}>
                      <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.name}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--sub)" }}>{s.total}</td>
                      <td style={{ padding: "10px 16px", color: "#10b981", fontWeight: 700 }}>{s.present}</td>
                      <td style={{ padding: "10px 16px", color: "#ef4444", fontWeight: 700 }}>{s.absent}</td>
                      <td style={{ padding: "10px 16px", color: "#f59e0b", fontWeight: 700 }}>{s.late}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden", minWidth: 60 }}>
                            <div style={{ width: s.rate + "%", height: "100%", borderRadius: 99, background: s.rate >= 80 ? "#10b981" : s.rate >= 60 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36, color: s.rate >= 80 ? "#10b981" : s.rate >= 60 ? "#f59e0b" : "#ef4444" }}>{s.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* PAYMENTS */}
      {tab === "Payments" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
            <StatBox label="Total Revenue" value={"$" + totalRevenue.toLocaleString()} sub="All payments" color="#8b5cf6" />
            <StatBox label="Paid"          value={paid.length}   sub={"$" + paid.reduce((s,p)=>s+Number(p.amount||0),0).toLocaleString()}   color="#10b981" />
            <StatBox label="Unpaid"        value={unpaid.length} sub={"$" + unpaid.reduce((s,p)=>s+Number(p.amount||0),0).toLocaleString()} color="#ef4444" />
            <StatBox label="Total Records" value={payments.length} sub="All time" color="#6366f1" />
          </div>

          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--text)" }}>Monthly Revenue</div>
            {revData.length === 0
              ? <div style={{ textAlign: "center", padding: 32, color: "var(--sub)" }}>No payment data yet</div>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => "$" + v.toLocaleString()} />
                    <Bar dataKey="total" fill="#8b5cf6" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </Card>

          <Card p={0}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input value={paySearch} onChange={e => setPaySearch(e.target.value)} placeholder="Search payments..."
                style={{ ...inp, minWidth: 200, flex: 1 }} />
              <select value={payFilter} onChange={e => setPayFilter(e.target.value)} style={{ ...inp, minWidth: 140 }}>
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
              </select>
              <span style={{ fontSize: 12, color: "var(--sub)" }}>{filteredPay.length} records</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--hover)" }}>
                  {["#","Student","Description","Amount","Date","Status"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPay.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--sub)" }}>No payment records found.</td></tr>
                )}
                {filteredPay.map((p, i) => {
                  const st = p.status || "";
                  const bg = st === "Paid" ? "#d1fae5" : st === "Unpaid" ? "#fee2e2" : "#fef3c7";
                  const cl = st === "Paid" ? "#10b981" : st === "Unpaid" ? "#ef4444" : "#f59e0b";
                  return (
                    <tr key={p.id || i} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--hover)" }}>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--sub)" }}>{i + 1}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.studentName || p.student_name || "—"}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--sub)" }}>{p.description || p.type || "—"}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>${Number(p.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--sub)" }}>{(p.date || p.due_date || p.created_at || "").slice(0, 10)}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: bg, color: cl }}>
                          {st || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;