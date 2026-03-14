// src/pages/Notes.jsx
import { useState, useEffect } from "react";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import { Field, FormGrid, SectionLabel, FormActions, SearchBar, Btn, Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const CATS = ["General", "Announcement", "Assignment", "Reminder", "Exam", "Resource"];
const CAT_COLORS = { General: "#6366f1", Announcement: "#f59e0b", Assignment: "#10b981", Reminder: "#ef4444", Exam: "#8b5cf6", Resource: "#3b82f6" };

const BLANK = { title: "", content: "", courseId: "", category: "General", pinned: false };

const NotesPage = ({ notes, setNotes, courses, role, user }) => {
  const [q, setQ] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewNote, setViewNote] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const canPost = role === "Admin" || role === "Teacher";

  // Teachers only see courses they teach; Admin sees all
  const myCourses = role === "Teacher"
    ? courses.filter(c => String(c.teacher_id) === String(user?.teacherId) || String(c.teacherId) === String(user?.teacherId))
    : courses;

  const filtered = notes.filter(n => {
    const matchQ = `${n.title} ${n.content} ${n.teacherName}`.toLowerCase().includes(q.toLowerCase());
    const matchCourse = !filterCourse || String(n.course_id) === String(filterCourse);
    const matchCat = !filterCat || n.category === filterCat;
    return matchQ && matchCourse && matchCat;
  });

  const pinned = filtered.filter(n => n.pinned);
  const regular = filtered.filter(n => !n.pinned);

  const openAdd = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit = n => { setEditing(n); setForm({ title: n.title, content: n.content, courseId: n.course_id || "", category: n.category || "General", pinned: !!n.pinned }); setModal(true); };

  const save = async () => {
    if (!form.title || !form.content || !form.courseId) { alert("Title, content and course are required."); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/notes/${editing.id}`, form);
      } else {
        await api.post("/notes", form);
      }
      const r = await api.get("/notes");
      setNotes(r.data);
      setModal(false);
    } catch (err) { alert("Error: " + (err.response?.data?.error || err.message)); }
    setSaving(false);
  };

  const remove = async id => {
    if (!window.confirm("Delete this note?")) return;
    await api.delete(`/notes/${id}`);
    setNotes(notes.filter(n => n.id !== id));
  };

  const NoteCard = ({ n }) => (
    <div onClick={() => setViewNote(n)} style={{ border: `1px solid var(--border)`, borderLeft: `4px solid ${CAT_COLORS[n.category] || "#6366f1"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: "var(--card)", transition: "box-shadow .15s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {n.pinned ? <span title="Pinned" style={{ fontSize: 14 }}>📌</span> : null}
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{n.title}</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--sub)", margin: "0 0 8px", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{n.content}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: CAT_COLORS[n.category] + "20", color: CAT_COLORS[n.category], padding: "2px 8px", borderRadius: 99 }}>{n.category}</span>
            {n.courseName && <span style={{ fontSize: 10, background: "var(--hover)", color: "var(--sub)", padding: "2px 8px", borderRadius: 99 }}>📚 {n.courseName}</span>}
            <span style={{ fontSize: 10, color: "var(--sub)" }}>👤 {n.teacherName || "Unknown"}</span>
          </div>
        </div>
        {canPost && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <Btn onClick={() => openEdit(n)} icon="edit" label="" small variant="ghost" />
            <Btn onClick={() => remove(n.id)} icon="trash" label="" small variant="danger" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Notes & Announcements" sub={`${notes.length} notes`}
        action={canPost ? <Btn onClick={openAdd} icon="plus" label="Post Note" /> : null} />

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search notes…" />
        </div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          style={{ background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text)", minWidth: 160 }}>
          <option value="">All Courses</option>
          {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text)", minWidth: 140 }}>
          <option value="">All Categories</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--sub)", border: "2px dashed var(--border)", borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}></div>
          <div style={{ fontWeight: 600 }}>No notes yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{canPost ? "Post the first note for your students." : "Your teacher hasn't posted any notes yet."}</div>
        </div>
      )}

      {pinned.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", marginBottom: 10 }}>📌 Pinned</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 12 }}>
            {pinned.map(n => <NoteCard key={n.id} n={n} />)}
          </div>
        </div>
      )}

      {regular.length > 0 && (
        <div>
          {pinned.length > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", marginBottom: 10 }}>All Notes</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 12 }}>
            {regular.map(n => <NoteCard key={n.id} n={n} />)}
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Note" : "Post New Note"} size="md">
        <FormGrid>
          <Field label="Title" value={form.title} onChange={set("title")} required />
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--sub)", marginBottom: 5, display: "block", textTransform: "uppercase" }}>Course (Required)</label>
            <select value={form.courseId} onChange={e => set("courseId")(e.target.value)}
              style={{ background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "var(--text)", width: "100%" }}>
              <option value="">-- Select Course --</option>
              {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Category" type="select" value={form.category} onChange={set("category")} options={CATS} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 22 }}>
            <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => set("pinned")(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="pinned" style={{ fontSize: 13, color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>📌 Pin this note</label>
          </div>
        </FormGrid>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--sub)", marginBottom: 6, display: "block", textTransform: "uppercase" }}>Content *</label>
          <textarea value={form.content} onChange={e => set("content")(e.target.value)} rows={8} placeholder="Write your note content here…"
            style={{ width: "100%", background: "var(--input)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text)", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <FormActions onCancel={() => setModal(false)} onSave={save} saveLabel={saving ? "Saving…" : editing ? "Update Note" : "Post Note"} />
      </Modal>

      {/* VIEW MODAL */}
      <Modal open={!!viewNote} onClose={() => setViewNote(null)} title="" size="md">
        {viewNote && (
          <div>
            <div style={{ borderLeft: `4px solid ${CAT_COLORS[viewNote.category] || "#6366f1"}`, paddingLeft: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{viewNote.title}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: CAT_COLORS[viewNote.category] + "20", color: CAT_COLORS[viewNote.category], padding: "2px 8px", borderRadius: 99 }}>{viewNote.category}</span>
                {viewNote.courseName && <span style={{ fontSize: 11, background: "var(--hover)", color: "var(--sub)", padding: "2px 8px", borderRadius: 99 }}>📚 {viewNote.courseName}</span>}
                <span style={{ fontSize: 11, color: "var(--sub)" }}>by {viewNote.teacherName}</span>
              </div>
            </div>
            <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap", background: "var(--hover)", borderRadius: 10, padding: 16 }}>{viewNote.content}</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotesPage;