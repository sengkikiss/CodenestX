// src/pages/Dashboard.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, StatCard, PageHeader } from "../components/ui/Form";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";

const fmt = v => "$" + Number(v || 0).toLocaleString();
const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444"];

// ── ADMIN / STAFF DASHBOARD ───────────────────────────────────────────────────
const AdminDashboard = ({ user, students, teachers, staff, payments }) => {
  const paid     = payments.filter(p => p.status === "Paid");
  const totalRev = paid.reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending  = payments.filter(p => p.status !== "Paid").length;

  // Real revenue by month from payments
  const revByMonth = payments
    .filter(p => p.status === "Paid")
    .reduce((acc, p) => {
      const d = p.created_at || p.due_date || "";
      const m = d.slice(0, 7);
      if (!m) return acc;
      acc[m] = (acc[m] || 0) + Number(p.amount || 0);
      return acc;
    }, {});
  const revData = Object.entries(revByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({ month: month.slice(5), total }));

  const gradeData = ["Grade 9","Grade 10","Grade 11","Grade 12"].map((g, i) => ({
    name: g, value: students.filter(s => s.grade === g).length, color: COLORS[i]
  }));

  return (
    <div>
      <PageHeader
        title={user?.role === "Staff" ? "Staff Dashboard" : "Admin Dashboard"}
        sub={new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        <StatCard label="Total Students" value={students.length} sub={students.filter(s=>s.status==="Active").length + " active"} icon="users" />
        <StatCard label="Total Teachers" value={teachers.length} sub={teachers.filter(t=>t.status==="Active").length + " active"} icon="user" />
        <StatCard label="Total Staff"    value={staff.length}    sub="All departments" icon="briefcase" />
        <StatCard label="Revenue (Paid)" value={fmt(totalRev)}   sub={pending + " pending"} icon="credit" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:16 }}>Monthly Revenue</div>
          {revData.length === 0
            ? <div style={{ textAlign:"center", padding:40, color:"var(--sub)", fontSize:13 }}>No payment data yet</div>
            : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"var(--sub)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize:10, fill:"var(--sub)" }} tickFormatter={v=>"$"+v.toLocaleString()} />
                  <Tooltip formatter={v=>["$"+Number(v).toLocaleString(),"Revenue"]} contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }} />
                  <Bar dataKey="total" name="Revenue" fill="#6366f1" radius={[4,4,0,0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
          }
        </Card>

        <Card>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:16 }}>Students by Grade</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={gradeData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                {gradeData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
          {gradeData.map(d => (
            <div key={d.name} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"3px 0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:d.color }} />
                <span style={{ color:"var(--sub)" }}>{d.name}</span>
              </div>
              <span style={{ fontWeight:700, color:"var(--text)" }}>{d.value}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card p={0}>
        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>Recent Payments</div>
        {payments.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"var(--sub)", fontSize:13 }}>No payments yet</div>
          : payments.slice(0, 6).map((p, i) => (
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 18px", borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Avatar name={p.student_name || p.studentName || "?"} size={30} />
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{p.student_name || p.studentName || "Student"}</div>
                  <div style={{ fontSize:11, color:"var(--sub)" }}>{p.type} · {p.invoice_no || ""}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{fmt(p.amount)}</div>
                <Badge status={p.status} />
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
};

// ── TEACHER DASHBOARD ─────────────────────────────────────────────────────────
const TeacherDashboard = ({ user, students, courses }) => {
  const myCourses = courses.filter(c =>
    String(c.teacher_id) === String(user?.teacherId) ||
    String(c.teacherId)  === String(user?.teacherId)
  );

  return (
    <div>
      <PageHeader title={"Welcome, " + (user?.name || "Teacher")} sub={new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        <StatCard label="My Courses"     value={myCourses.length} sub="Assigned to you" icon="book" />
        <StatCard label="Total Students" value={myCourses.reduce((s,c)=>s+Number(c.enrolledCount||0),0)} sub="In my courses" icon="users" />
        <StatCard label="Today" value={new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})} sub={new Date().toLocaleDateString("en-US",{weekday:"long"})} icon="calendar" />
      </div>

      <Card p={0}>
        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>My Courses</div>
        {myCourses.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"var(--sub)", fontSize:13 }}>No courses assigned yet</div>
          : myCourses.map((c, i) => (
            <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 18px", borderBottom: i < myCourses.length-1 ? "1px solid var(--border)" : "none" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{c.name}</div>
                <div style={{ fontSize:11, color:"var(--sub)" }}>{c.grade || ""}{c.section ? " · " + c.section : ""}{c.schedule ? " · " + c.schedule : ""}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:12, color:"var(--sub)" }}>{c.enrolledCount || 0} students</span>
                <Badge status={c.status || "Active"} />
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
};

// ── STUDENT DASHBOARD ─────────────────────────────────────────────────────────
const StudentDashboard = ({ user, courses, payments, notes }) => {
  const myPayments = payments.filter(p =>
    String(p.studentId) === String(user?.id) || String(p.student_id) === String(user?.id)
  );
  const unpaid   = myPayments.filter(p => p.status !== "Paid");
  const totalPaid = myPayments.filter(p => p.status === "Paid").reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div>
      <PageHeader title={"Hello, " + (user?.name || "Student")} sub={new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        <StatCard label="My Courses"   value={courses.length}   sub="Enrolled"    icon="book" />
        <StatCard label="Pending Fees" value={unpaid.length}    sub="Invoices due" icon="credit" />
        <StatCard label="Total Paid"   value={fmt(totalPaid)}   sub="All time"    icon="check" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card p={0}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>My Courses</div>
          {courses.length === 0
            ? <div style={{ padding:24, textAlign:"center", color:"var(--sub)", fontSize:13 }}>No courses enrolled</div>
            : courses.map((c, i) => (
              <div key={c.id} style={{ padding:"12px 18px", borderBottom: i < courses.length-1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{c.name}</div>
                <div style={{ fontSize:11, color:"var(--sub)", marginTop:2 }}>{c.grade || ""}{c.teacherName ? " · " + c.teacherName : ""}</div>
              </div>
            ))
          }
        </Card>

        <Card p={0}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>My Payments</div>
          {myPayments.length === 0
            ? <div style={{ padding:24, textAlign:"center", color:"var(--sub)", fontSize:13 }}>No payment records</div>
            : myPayments.slice(0, 5).map((p, i) => (
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 18px", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{p.type || "Payment"}</div>
                  <div style={{ fontSize:11, color:"var(--sub)" }}>{(p.due_date || p.dueDate || "").slice(0,10)}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{fmt(p.amount)}</div>
                  <Badge status={p.status} />
                </div>
              </div>
            ))
          }
        </Card>
      </div>

      <Card p={0}>
        <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>Recent Announcements</div>
        {notes.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"var(--sub)", fontSize:13 }}>No announcements</div>
          : notes.slice(0, 4).map((n, i) => (
            <div key={n.id} style={{ padding:"12px 18px", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{n.title}</div>
                <Badge status={n.category || "General"} />
              </div>
              <div style={{ fontSize:12, color:"var(--sub)", marginTop:4 }}>
                {(n.content || "").slice(0, 100)}{(n.content || "").length > 100 ? "…" : ""}
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
};

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
const Dashboard = ({ user, students, teachers, staff, courses, payments, notes }) => {
  const role = user?.role;
  if (role === "Teacher") return <TeacherDashboard user={user} students={students} courses={courses} />;
  if (role === "Student") return <StudentDashboard user={user} courses={courses} payments={payments} notes={notes || []} />;
  // Admin and Staff both see the admin-style dashboard
  return <AdminDashboard user={user} students={students} teachers={teachers} staff={staff} payments={payments} />;
};

export default Dashboard;