// src/pages/Courses.jsx
import { useState, useRef } from "react";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Avatar from "../components/ui/Avatar";
import Table from "../components/ui/Table";
import { Field, FormGrid, SectionLabel, FormActions, SearchBar, Btn, Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const API = "http://localhost:5000";

const BLANK = {
  name: "", code: "", teacherId: "", grade: "", section: "", maxStudents: 30,
  duration: "", schedule: "", startDate: "", endDate: "", room: "", credits: 3,
  description: "", status: "Active"
};

const selectStyle = {
  background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8,
  padding: "8px 12px", fontSize: 13, color: "var(--text)", width: "100%", outline: "none"
};
const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "var(--sub)", marginBottom: 5,
  display: "block", textTransform: "uppercase", letterSpacing: ".5px"
};

const typeIcon = { note: "📝", video: "🎬", pdf: "📄", link: "🔗", file: "📎" };

const CoursesPage = ({ courses, setCourses, teachers, students, role, user }) => {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailCourse, setDetailCourse] = useState(null);
  const [detailTab, setDetailTab] = useState("chapters");
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  // Chapter
  const [chapterModal, setChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: "", description: "" });

  // Material
  const [materialModal, setMaterialModal] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [materialForm, setMaterialForm] = useState({ title: "", type: "note", content: "" });
  const [materialFile, setMaterialFile] = useState(null);
  const fileRef = useRef();

  // Enroll
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollSearch, setEnrollSearch] = useState("");

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const canEdit = role === "Admin";
  const canManage = role === "Admin" || role === "Teacher";

  // Teachers only see their own courses
  const visibleCourses = role === "Teacher"
    ? courses.filter(c => String(c.teacher_id) === String(user?.teacherId) || String(c.teacherId) === String(user?.teacherId))
    : courses;

  const filtered = visibleCourses.filter(c =>
    `${c.name} ${c.code} ${c.teacherName} ${c.grade}`.toLowerCase().includes(q.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit = c => { setEditing(c); setForm({ ...BLANK, ...c }); setModal(true); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/courses/${editing.id}`, form);
      } else {
        await api.post("/courses", form);
      }
      const r = await api.get("/courses");
      setCourses(r.data);
      setModal(false);
    } catch (err) { alert("Error: " + (err.response?.data?.error || err.message)); }
    setSaving(false);
  };

  const remove = async id => {
    if (!window.confirm("Delete this course?")) return;
    await api.delete(`/courses/${id}`);
    setCourses(courses.filter(c => c.id !== id));
  };

  const openDetail = async c => {
    try {
      const res = await api.get(`/courses/${c.id}`);
      setDetailCourse(res.data);
      setDetailTab("chapters");
    } catch { setDetailCourse({ ...c, chapters: [], students: [] }); }
  };

  const refreshDetail = async (id) => {
    const courseId = id || (detailCourse && detailCourse.id);
    if (!courseId) return;
    const res = await api.get(`/courses/${courseId}`);
    setDetailCourse(res.data);
  };

  // ── CHAPTERS ──────────────────────────────────────────────────────────
  const openAddChapter = () => {
    setEditingChapter(null);
    setChapterForm({ title: "", description: "" });
    setChapterModal(true);
  };
  const openEditChapter = ch => {
    setEditingChapter(ch);
    setChapterForm({ title: ch.title, description: ch.description || "" });
    setChapterModal(true);
  };

  const saveChapter = async () => {
    if (!chapterForm.title) return;
    try {
      if (editingChapter) {
        await api.put(`/courses/${detailCourse.id}/chapters/${editingChapter.id}`, chapterForm);
      } else {
        await api.post(`/courses/${detailCourse.id}/chapters`, chapterForm);
      }
      await refreshDetail(detailCourse?.id);
      setChapterModal(false);
    } catch (err) { alert("Error: " + (err.response?.data?.error || err.message)); }
  };

  const deleteChapter = async chId => {
    if (!window.confirm("Delete this chapter and all its materials?")) return;
    await api.delete(`/courses/${detailCourse.id}/chapters/${chId}`);
    await refreshDetail(detailCourse?.id);
  };

  // ── MATERIALS ─────────────────────────────────────────────────────────
  const openAddMaterial = chId => {
    setActiveChapterId(chId);
    setMaterialForm({ title: "", type: "note", content: "" });
    setMaterialFile(null);
    setMaterialModal(true);
  };

  const saveMaterial = async () => {
    if (!materialForm.title) return;
    try {
      const fd = new FormData();
      fd.append("title", materialForm.title);
      fd.append("type", materialForm.type);
      fd.append("content", materialForm.content || "");
      if (materialFile) fd.append("file", materialFile);
      await api.post(
        `/courses/${detailCourse.id}/chapters/${activeChapterId}/materials`,
        fd, { headers: { "Content-Type": "multipart/form-data" } }
      );
      await refreshDetail(detailCourse?.id);
      setMaterialModal(false);
    } catch (err) { alert("Error: " + (err.response?.data?.error || err.message)); }
  };

  const deleteMaterial = async (chId, matId) => {
    if (!window.confirm("Delete this material?")) return;
    await api.delete(`/courses/${detailCourse.id}/chapters/${chId}/materials/${matId}`);
    await refreshDetail(detailCourse?.id);
  };

  // ── ENROLLMENT ────────────────────────────────────────────────────────
  const enrollStudent = async sid => {
    try {
      await api.post(`/courses/${detailCourse.id}/enroll`, { studentId: sid });
      await refreshDetail(detailCourse?.id);
    } catch (err) { alert("Error: " + (err.response?.data?.error || err.message)); }
  };

  const unenrollStudent = async sid => {
    if (!window.confirm("Remove this student from the course?")) return;
    await api.delete(`/courses/${detailCourse.id}/enroll/${sid}`);
    await refreshDetail(detailCourse?.id);
  };

  const notEnrolled = students.filter(s => !(detailCourse?.students || []).find(e => e.id === s.id))
    .filter(s => `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(enrollSearch.toLowerCase()));

  return (
    <div>
      <PageHeader title="Course Management" sub={`${courses.length} courses`}
        action={canEdit ? <Btn onClick={openAdd} icon="plus" label="Add Course" /> : null} />

      <Card p={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search courses…" />
          <span style={{ fontSize: 12, color: "var(--sub)" }}>{filtered.length} results</span>
        </div>
        <Table
          cols={[
            { key: "name", label: "Course", render: (v, r) => (
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--sub)" }}>{r.code} · {r.grade}</div>
              </div>
            )},
            { key: "teacherName", label: "Teacher" },
            { key: "schedule", label: "Schedule" },
            { key: "enrolledCount", label: "Students", render: v => <span style={{ fontWeight: 700 }}>{v || 0}</span> },
            { key: "credits", label: "Credits" },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
          ]}
          rows={filtered}
          actions={row => (
            <div style={{ display: "flex", gap: 4 }}>
              <Btn onClick={() => openDetail(row)} icon="eye" label="" small variant="ghost" />
              {canEdit && <>
                <Btn onClick={() => openEdit(row)} icon="edit" label="" small variant="ghost" />
                <Btn onClick={() => remove(row.id)} icon="trash" label="" small variant="danger" />
              </>}
            </div>
          )}
        />
      </Card>

      {/* ADD/EDIT MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Course" : "Add New Course"} size="lg">
        <SectionLabel>Course Details</SectionLabel>
        <FormGrid>
          <Field label="Course Name" value={form.name} onChange={set("name")} required />
          <Field label="Course Code" value={form.code} onChange={set("code")} placeholder="e.g. CS-101" />
          <div>
            <label style={labelStyle}>Teacher</label>
            <select value={form.teacherId} onChange={e => set("teacherId")(Number(e.target.value))} style={selectStyle}>
              <option value="">-- Select Teacher --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.prefix} {t.firstName} {t.lastName}</option>
              ))}
            </select>
          </div>
          <Field label="Grade" type="select" value={form.grade} onChange={set("grade")} options={["", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]} />
          <Field label="Section" type="select" value={form.section} onChange={set("section")} options={["", "A", "B", "C", "D", "All"]} />
          <Field label="Max Students" type="number" value={form.maxStudents} onChange={set("maxStudents")} />
          <Field label="Credits" type="number" value={form.credits} onChange={set("credits")} />
          <Field label="Duration" value={form.duration} onChange={set("duration")} placeholder="e.g. 16 weeks" />
          <Field label="Schedule" value={form.schedule} onChange={set("schedule")} placeholder="e.g. Mon/Wed 9:00-10:30" />
          <Field label="Room" value={form.room} onChange={set("room")} placeholder="e.g. Room 101" />
          <Field label="Start Date" type="date" value={form.startDate} onChange={set("startDate")} />
          <Field label="End Date" type="date" value={form.endDate} onChange={set("endDate")} />
          <Field label="Status" type="select" value={form.status} onChange={set("status")} options={["Active", "Inactive", "Completed"]} />
          <Field label="Course Description" value={form.description} onChange={set("description")} placeholder="What students will learn…" />
        </FormGrid>
        <FormActions onCancel={() => setModal(false)} onSave={save} saveLabel={saving ? "Saving…" : editing ? "Update Course" : "Create Course"} />
      </Modal>

      {/* COURSE DETAIL MODAL */}
      {detailCourse && (
        <Modal open={!!detailCourse} onClose={() => setDetailCourse(null)} title={detailCourse.name} size="lg">

          {/* INFO BAR */}
          <div style={{ marginBottom: 16, padding: 14, background: "var(--hover)", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[["Teacher", detailCourse.teacherName || "—"], ["Grade", detailCourse.grade || "—"], ["Schedule", detailCourse.schedule || "—"], ["Students", (detailCourse.students?.length || 0) + " enrolled"]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase" }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["Chapters", "Students"].map(tab => (
              <button key={tab} onClick={() => setDetailTab(tab.toLowerCase())}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", fontWeight: 600, fontSize: 13,
                  background: detailTab === tab.toLowerCase() ? "var(--text)" : "var(--hover)",
                  color: detailTab === tab.toLowerCase() ? "var(--card)" : "var(--text)" }}>
                {tab}
                {tab === "Students" && <span style={{ marginLeft: 6, background: "var(--border)", borderRadius: 99, padding: "1px 7px", fontSize: 11 }}>{detailCourse.students?.length || 0}</span>}
              </button>
            ))}
          </div>

          {/* CHAPTERS TAB */}
          {detailTab === "chapters" && (
            <div>
              {canManage && (
                <div style={{ marginBottom: 14 }}>
                  <Btn onClick={openAddChapter} icon="plus" label="Add Chapter" />
                </div>
              )}
              {(!detailCourse.chapters || detailCourse.chapters.length === 0) && (
                <div style={{ textAlign: "center", padding: 40, color: "var(--sub)", border: "2px dashed var(--border)", borderRadius: 10 }}>
                  No chapters yet. Click "Add Chapter" to get started.
                </div>
              )}
              {(detailCourse.chapters || []).map((ch, i) => (
                <div key={ch.id} style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--hover)" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, background: "var(--text)", color: "var(--card)", borderRadius: 99, padding: "1px 8px", fontWeight: 700 }}>Ch.{i + 1}</span>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>{ch.title}</span>
                      </div>
                      {ch.description && <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 3, paddingLeft: 2 }}>{ch.description}</div>}
                    </div>
                    {canManage && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <Btn onClick={() => openAddMaterial(ch.id)} icon="plus" label="Add Material" small variant="ghost" />
                        <Btn onClick={() => openEditChapter(ch)} icon="edit" label="" small variant="ghost" />
                        <Btn onClick={() => deleteChapter(ch.id)} icon="trash" label="" small variant="danger" />
                      </div>
                    )}
                  </div>
                  {(ch.materials || []).length === 0 && (
                    <div style={{ padding: "10px 16px", fontSize: 12, color: "var(--sub)", fontStyle: "italic" }}>No materials yet.</div>
                  )}
                  {(ch.materials || []).map(m => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{typeIcon[m.type] || "📎"}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.title}</div>
                          {m.content && <div style={{ fontSize: 11, color: "var(--sub)" }}>{m.content.slice(0, 100)}{m.content.length > 100 ? "…" : ""}</div>}
                          {m.file_path && (
                            <a href={API + m.file_path} target="_blank" rel="noreferrer"
                              style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>
                              📥 Download File
                            </a>
                          )}
                        </div>
                      </div>
                      {canManage && <Btn onClick={() => deleteMaterial(ch.id, m.id)} icon="trash" label="" small variant="danger" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* STUDENTS TAB */}
          {detailTab === "students" && (
            <div>
              {canManage && (
                <div style={{ marginBottom: 14 }}>
                  <Btn onClick={() => { setEnrollSearch(""); setEnrollModal(true); }} icon="plus" label="Enroll Student" />
                </div>
              )}
              {(!detailCourse.students || detailCourse.students.length === 0) && (
                <div style={{ textAlign: "center", padding: 40, color: "var(--sub)", border: "2px dashed var(--border)", borderRadius: 10 }}>
                  No students enrolled yet.
                </div>
              )}
              {(detailCourse.students || []).map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={s.name || `${s.firstName} ${s.lastName}`} size={34} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.name || `${s.firstName} ${s.lastName}`}</div>
                      <div style={{ fontSize: 11, color: "var(--sub)" }}>{s.email} · {s.grade}</div>
                    </div>
                  </div>
                  {canManage && <Btn onClick={() => unenrollStudent(s.id)} label="Remove" small variant="danger" />}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* CHAPTER MODAL */}
      <Modal open={chapterModal} onClose={() => setChapterModal(false)} title={editingChapter ? "Edit Chapter" : "Add Chapter"} size="sm">
        <FormGrid>
          <Field label="Chapter Title" value={chapterForm.title} onChange={v => setChapterForm(f => ({ ...f, title: v }))} required />
          <Field label="Description (optional)" value={chapterForm.description} onChange={v => setChapterForm(f => ({ ...f, description: v }))} />
        </FormGrid>
        <FormActions onCancel={() => setChapterModal(false)} onSave={saveChapter} saveLabel={editingChapter ? "Update Chapter" : "Add Chapter"} />
      </Modal>

      {/* MATERIAL MODAL */}
      <Modal open={materialModal} onClose={() => setMaterialModal(false)} title="Add Material" size="sm">
        <FormGrid>
          <Field label="Title" value={materialForm.title} onChange={v => setMaterialForm(f => ({ ...f, title: v }))} required />
          <div>
            <label style={labelStyle}>Type</label>
            <select value={materialForm.type} onChange={e => setMaterialForm(f => ({ ...f, type: e.target.value }))} style={selectStyle}>
              <option value="note">📝 Note / Text</option>
              <option value="video">🎬 Video URL</option>
              <option value="pdf">📄 PDF / Document</option>
              <option value="link">🔗 External Link</option>
              <option value="file">📎 File Upload</option>
            </select>
          </div>
          {(materialForm.type === "note" || materialForm.type === "video" || materialForm.type === "link") && (
            <Field label={materialForm.type === "note" ? "Content / Notes" : "URL"} value={materialForm.content}
              onChange={v => setMaterialForm(f => ({ ...f, content: v }))}
              placeholder={materialForm.type === "note" ? "Write notes here…" : "https://…"} />
          )}
          {(materialForm.type === "pdf" || materialForm.type === "file") && (
            <div>
              <label style={labelStyle}>Upload File (PDF, DOC, DOCX, PPT, PPTX)</label>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                onChange={e => setMaterialFile(e.target.files[0])}
                style={{ ...selectStyle, padding: "6px 12px", cursor: "pointer" }} />
              {materialFile && <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 4 }}>📎 {materialFile.name}</div>}
            </div>
          )}
        </FormGrid>
        <FormActions onCancel={() => setMaterialModal(false)} onSave={saveMaterial} saveLabel="Add Material" />
      </Modal>

      {/* ENROLL MODAL */}
      <Modal open={enrollModal} onClose={() => setEnrollModal(false)} title="Enroll Student" size="sm">
        <SearchBar value={enrollSearch} onChange={setEnrollSearch} placeholder="Search students…" />
        <div style={{ marginTop: 12, maxHeight: 340, overflowY: "auto" }}>
          {notEnrolled.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, color: "var(--sub)", fontSize: 13 }}>
              All students enrolled or none match.
            </div>
          )}
          {notEnrolled.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={`${s.firstName} ${s.lastName}`} size={32} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: 11, color: "var(--sub)" }}>{s.grade} · {s.email}</div>
                </div>
              </div>
              <Btn onClick={() => enrollStudent(s.id)} label="+ Enroll" small />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CoursesPage;