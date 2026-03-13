// src/pages/Attendance.jsx
import { useState, useEffect } from "react";
import Avatar from "../components/ui/Avatar";
import { SearchBar, Btn, Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const API = "http://localhost:5000";
const STATUS_COLORS = { Present: "#10b981", Absent: "#ef4444", Late: "#f59e0b" };
const STATUS_BG     = { Present: "#d1fae5", Absent: "#fee2e2", Late: "#fef3c7" };
const today = () => new Date().toISOString().split("T")[0];

const AvatarImg = ({ url, name, size = 34 }) => {
  const [err, setErr] = useState(false);
  if (url && !err) {
    const src = url.startsWith("http") ? url : API + url;
    return <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />;
  }
  return <Avatar name={name} size={size} />;
};

const AttendancePage = ({ courses = [], role, user }) => {
  const [tab, setTab] = useState("mark");

  // Mark tab
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(today());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [q, setQ] = useState("");

  // View tab
  const [viewCourse, setViewCourse] = useState("");
  const [courseDates, setCourseDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRecords, setDateRecords] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const myCourses = role === "Teacher"
    ? courses.filter(c => String(c.teacher_id) === String(user?.teacherId) || String(c.teacherId) === String(user?.teacherId))
    : courses;

  // Load students + lock status when course/date changes
  useEffect(() => {
    if (!selectedCourse || !date) { setStudents([]); setLocked(false); return; }
    setLoading(true); setSaved(false);
    Promise.all([
      api.get(`/attendance/course?courseId=${selectedCourse}&date=${date}`),
      api.get(`/attendance/check-locked?courseId=${selectedCourse}&date=${date}`)
    ]).then(([stuRes, lockRes]) => {
      setStudents(stuRes.data);
      setLocked(lockRes.data.locked);
    }).catch(err => alert("Error: " + (err.response?.data?.error || err.message)))
      .finally(() => setLoading(false));
  }, [selectedCourse, date]);

  const setStatus = (studentId, status) => {
    if (locked) return;
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const markAll = status => {
    if (locked) return;
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const save = async () => {
    if (!selectedCourse || locked) return;
    setSaving(true);
    try {
      await api.post("/attendance/mark", {
        courseId: selectedCourse, date,
        records: students.map(s => ({ studentId: s.studentId, status: s.status }))
      });
      setSaved(true);
      setLocked(true);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  // Load dates for view tab
  useEffect(() => {
    if (!viewCourse) { setCourseDates([]); setSelectedDate(null); setDateRecords([]); return; }
    setViewLoading(true);
    api.get(`/attendance/dates?courseId=${viewCourse}`)
      .then(r => setCourseDates(r.data))
      .catch(err => alert("Error: " + (err.response?.data?.error || err.message)))
      .finally(() => setViewLoading(false));
  }, [viewCourse]);

  const loadDateRecords = async (d) => {
    const dateStr = String(d).slice(0, 10);
    setSelectedDate(dateStr);
    try {
      const res = await api.get(`/attendance/date-records?courseId=${viewCourse}&date=${dateStr}`);
      setDateRecords(res.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const filtered = students.filter(s =>
    `${s.name || ""} ${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(q.toLowerCase())
  );
  const counts = {
    Present: students.filter(s => s.status === "Present").length,
    Absent:  students.filter(s => s.status === "Absent").length,
    Late:    students.filter(s => s.status === "Late").length,
  };
  const course = myCourses.find(c => String(c.id) === String(selectedCourse));
  const viewCourseName = courses.find(c => String(c.id) === String(viewCourse))?.name;

  const inp = { background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div>
      <PageHeader title="Attendance" sub="Mark and view student attendance" />

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["mark", "Take Attendance"], ["view", "View Records"]].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer",
              fontWeight: 600, fontSize: 13,
              background: tab === t ? "var(--text)" : "var(--hover)",
              color: tab === t ? "var(--card)" : "var(--text)" }}>
            {label}
          </button>
        ))}
      </div>

      {/* MARK TAB */}
      {tab === "mark" && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Course</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={inp}>
                  <option value="">-- Select Course --</option>
                  {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}{c.grade ? ` · ${c.grade}` : ""}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
              </div>
              <Btn onClick={save}
                label={saving ? "Saving..." : locked ? "Locked" : saved ? "Saved" : "Save Attendance"}
                style={{ background: locked ? "#94a3b8" : saved ? "#10b981" : undefined, minWidth: 140, cursor: locked ? "not-allowed" : "pointer" }}
                disabled={!selectedCourse || students.length === 0 || locked || saving} />
            </div>
            {locked && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, fontSize: 12, color: "#92400e" }}>
                Attendance for this date has already been saved and cannot be modified.
              </div>
            )}
          </Card>

          {!selectedCourse && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--sub)", border: "2px dashed var(--border)", borderRadius: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Select a course to take attendance</div>
            </div>
          )}

          {selectedCourse && loading && <div style={{ textAlign: "center", padding: 40, color: "var(--sub)" }}>Loading...</div>}

          {selectedCourse && !loading && students.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--sub)", border: "2px dashed var(--border)", borderRadius: 12 }}>
              <div style={{ fontWeight: 600 }}>No students enrolled in this course</div>
            </div>
          )}

          {selectedCourse && !loading && students.length > 0 && (
            <Card p={0}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{course?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--sub)" }}>{date} &middot; {students.length} students</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {Object.entries(counts).map(([s, n]) => (
                    <div key={s} style={{ padding: "4px 12px", borderRadius: 99, background: STATUS_BG[s], color: STATUS_COLORS[s], fontSize: 12, fontWeight: 700 }}>
                      {s}: {n}
                    </div>
                  ))}
                </div>
              </div>

              {!locked && (
                <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <SearchBar value={q} onChange={setQ} placeholder="Search student..." />
                  <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                    <span style={{ fontSize: 12, color: "var(--sub)", alignSelf: "center" }}>Mark all:</span>
                    {["Present", "Absent", "Late"].map(s => (
                      <button key={s} onClick={() => markAll(s)}
                        style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${STATUS_COLORS[s]}`, background: STATUS_BG[s], color: STATUS_COLORS[s], fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                {filtered.map((s, i) => (
                  <div key={s.studentId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--sub)", width: 24, textAlign: "right" }}>{i + 1}</span>
                      <AvatarImg url={s.avatar_url} name={s.name || `${s.firstName} ${s.lastName}`} />
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.name || `${s.firstName} ${s.lastName}`}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["Present", "Absent", "Late"].map(status => (
                        <button key={status} onClick={() => setStatus(s.studentId, status)} disabled={locked}
                          style={{
                            padding: "6px 16px", borderRadius: 8,
                            border: `2px solid ${s.status === status ? STATUS_COLORS[status] : "var(--border)"}`,
                            background: s.status === status ? STATUS_BG[status] : "var(--hover)",
                            color: s.status === status ? STATUS_COLORS[status] : "var(--sub)",
                            fontSize: 12, fontWeight: 700, cursor: locked ? "not-allowed" : "pointer", transition: "all .15s"
                          }}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!locked && (
                <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                  <Btn onClick={save} label={saving ? "Saving..." : "Save Attendance"} disabled={saving} />
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* VIEW TAB */}
      {tab === "view" && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Select Course</label>
            <select value={viewCourse} onChange={e => { setViewCourse(e.target.value); setSelectedDate(null); setDateRecords([]); }}
              style={{ ...inp, maxWidth: 360 }}>
              <option value="">-- Select Course --</option>
              {(role === "Admin" ? courses : myCourses).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Card>

          {!viewCourse && (
            <div style={{ textAlign: "center", padding: 60, color: "var(--sub)", border: "2px dashed var(--border)", borderRadius: 12 }}>
              <div style={{ fontWeight: 600 }}>Select a course to browse attendance records</div>
            </div>
          )}

          {viewCourse && viewLoading && <div style={{ textAlign: "center", padding: 40, color: "var(--sub)" }}>Loading...</div>}

          {viewCourse && !viewLoading && (
            <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "280px 1fr" : "1fr", gap: 16 }}>
              <Card p={0}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                  {viewCourseName} &mdash; {courseDates.length} session{courseDates.length !== 1 ? "s" : ""}
                </div>
                {courseDates.length === 0 && (
                  <div style={{ padding: 24, textAlign: "center", color: "var(--sub)", fontSize: 13 }}>No attendance recorded yet.</div>
                )}
                {courseDates.map(d => (
                  <div key={d.date} onClick={() => loadDateRecords(d.date)}
                    style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                      background: selectedDate === String(d.date).slice(0,10) ? "var(--hover)" : "transparent",
                      borderLeft: selectedDate === String(d.date).slice(0,10) ? "3px solid var(--text)" : "3px solid transparent" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{String(d.date).slice(0, 10)}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>Present {d.present}</span>
                      <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>Absent {d.absent}</span>
                      {Number(d.late) > 0 && <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>Late {d.late}</span>}
                    </div>
                  </div>
                ))}
              </Card>

              {selectedDate && (
                <Card p={0}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--text)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{selectedDate}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Present", "Absent", "Late"].map(s => (
                        <span key={s} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 99, background: STATUS_BG[s], color: STATUS_COLORS[s], fontWeight: 700 }}>
                          {s}: {dateRecords.filter(r => r.status === s).length}
                        </span>
                      ))}
                    </div>
                  </div>
                  {dateRecords.length === 0 && (
                    <div style={{ padding: 24, textAlign: "center", color: "var(--sub)", fontSize: 13 }}>No records found.</div>
                  )}
                  {dateRecords.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < dateRecords.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: "var(--sub)", width: 22 }}>{i + 1}</span>
                        <AvatarImg url={r.avatar_url} name={r.name || `${r.firstName} ${r.lastName}`} />
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{r.name || `${r.firstName} ${r.lastName}`}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 14px", borderRadius: 99, background: STATUS_BG[r.status], color: STATUS_COLORS[r.status] }}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendancePage;