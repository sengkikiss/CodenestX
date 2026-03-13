// src/App.jsx
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import api from "./services/api";
import Sidebar from "./components/layout/Sidebar";
import Topbar  from "./components/layout/Topbar";
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import StudentsPage  from "./pages/Students";
import TeachersPage  from "./pages/Teachers";
import StaffPage     from "./pages/Staff";
import CoursesPage   from "./pages/Courses";
import VideosPage    from "./pages/Videos";
import PaymentsPage  from "./pages/Payments";
import NotesPage     from "./pages/Notes";
import AttendancePage from "./pages/Attendance";
import ReportsPage   from "./pages/Reports";
import SettingsPage  from "./pages/Settings";
import { STUDENTS, TEACHERS, STAFF, COURSES, PAYMENTS, NOTES, VIDEOS } from "./data/mockData";

const LIGHT = {"--bg":"#f5f6fa","--card":"#ffffff","--sidebar":"#ffffff","--border":"#e8eaed","--borderLight":"#f1f3f5","--text":"#111827","--sub":"#6b7280","--hover":"#f8f9fb","--navActive":"#f0f2f5","--input":"#ffffff"};
const DARK  = {"--bg":"#0f1117","--card":"#1a1d27","--sidebar":"#13151e","--border":"#2a2d3e","--borderLight":"#1e2130","--text":"#e8eaf0","--sub":"#8b92a5","--hover":"#1e2130","--navActive":"#252836","--input":"#1e2130"};

const Inner = () => {
  const { user, setUser, logout } = useAuth();
  const [dark, setDark]           = useState(false);
  const [page, setPage]           = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [students,  setStudents]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [staff,     setStaff]     = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [notes,     setNotes]     = useState([]);
  const [videos,    setVideos]    = useState([]);

  // Load all data from API on mount
  useEffect(() => {
    const role = user?.role;
    // Courses: students only see enrolled
    if (role === "Student") {
      api.get(`/courses/student/${user.id}`).then(r => setCourses(r.data)).catch(() => {});
    } else {
      api.get("/courses").then(r => setCourses(r.data)).catch(() => {});
    }
    // Data available to all relevant roles
    if (role !== "Student") {
      api.get("/students").then(r => setStudents(r.data)).catch(() => {});
      api.get("/teachers").then(r => setTeachers(r.data)).catch(() => {});
    }
    if (role === "Admin" || role === "Staff") {
      api.get("/staff").then(r => setStaff(r.data)).catch(() => {});
      api.get("/payments").then(r => setPayments(r.data)).catch(() => {});
    }
    api.get("/notes").then(r => setNotes(r.data)).catch(() => {});
    api.get("/videos").then(r => setVideos(r.data)).catch(() => {});
  }, [user?.id]);

  const theme = dark ? DARK : LIGHT;
  const cssVars = Object.entries(theme).map(([k,v])=>`${k}:${v}`).join(";");

  const PAGES = {
    dashboard:  <Dashboard user={user} students={students} teachers={teachers} staff={staff} courses={courses} payments={payments} notes={notes} />,
    students:   <StudentsPage   students={students}  setStudents={setStudents}   role={user.role} />,
    teachers:   <TeachersPage   teachers={teachers}  setTeachers={setTeachers}   courses={courses} role={user.role} />,
    staff:      <StaffPage      staff={staff}         setStaff={setStaff}         role={user.role} />,
    courses:    <CoursesPage    courses={courses}     setCourses={setCourses}     teachers={teachers} students={students} role={user.role} user={user} />,
    videos:     <VideosPage     videos={videos}       setVideos={setVideos}       teachers={teachers} courses={courses} role={user.role} user={user} />,
    payments:   <PaymentsPage   payments={payments}   setPayments={setPayments}   students={students} role={user.role} />,
    notes:      <NotesPage      notes={notes}         setNotes={setNotes}         teachers={teachers} courses={courses} role={user.role} user={user} />,
    attendance: <AttendancePage courses={courses} role={user.role} user={user} />,
    reports:    <ReportsPage    students={students}   teachers={teachers}         payments={payments} courses={courses} role={user.role} user={user} />,
    settings:   <SettingsPage   dark={dark} setDark={setDark} user={user} setUser={setUser} />,
  };

  return (
    <div style={{ height:"100vh", overflow:"hidden", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',system-ui,sans-serif}
        :root{${cssVars}} body{background:var(--bg);color:var(--text)}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
        select option{background:var(--card);color:var(--text)}
        input[type=date]{color-scheme:${dark?"dark":"light"}}
      `}</style>

      <div style={{ width:collapsed?58:220, flexShrink:0, height:"100vh", transition:"width .25s" }}>
        <Sidebar page={page} setPage={setPage} user={user} onLogout={logout} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <Topbar user={user} dark={dark} setDark={setDark} />
        <div style={{ flex:1, overflowY:"auto", padding:28, background:"var(--bg)" }}>
          {PAGES[page] ?? PAGES.dashboard}
        </div>
      </div>
    </div>
  );
};

const AppRouter = () => {
  const { user } = useAuth();
  const cssVars = Object.entries(LIGHT).map(([k,v])=>`${k}:${v}`).join(";");

  if (!user) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',system-ui,sans-serif}
        :root{${cssVars}} body{background:var(--bg)}
      `}</style>
      <Login />
    </>
  );
  return <Inner />;
};

const App = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;