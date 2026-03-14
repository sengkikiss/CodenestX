// src/pages/Students.jsx
import { useState, useRef } from "react";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import { Field, FormGrid, SectionLabel, FormActions, SearchBar, Btn, Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const API = "http://localhost:5000";
const today = () => new Date().toISOString().split("T")[0];
const BLANK_STU = {
  firstName: "", lastName: "", email: "", phone: "", dob: "", gender: "",
  major: "", yearOfStudy: "", address: "", status: "Active", enrolled: today()
};

const AvatarImg = ({ url, name, size = 34 }) => {
  const [err, setErr] = useState(false);
  if (url && !err) {
    const src = url.startsWith("http") ? url : API + url;
    return <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />;
  }
  return <Avatar name={name} size={size} />;
};

const StudentsPage = ({ students, setStudents, role }) => {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [newCreds, setNewCreds] = useState(null);
  const [form, setForm] = useState(BLANK_STU);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email} ${s.major || ""}`.toLowerCase().includes(q.toLowerCase())
  );
  const canEdit = role === "Admin" || role === "Staff";

  const openAdd = () => {
    setEditing(null);
    setForm({ ...BLANK_STU, enrolled: today() });
    setAvatarPreview(null);
    setAvatarFile(null);
    setModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      firstName:   s.firstName   || "",
      lastName:    s.lastName    || "",
      email:       s.email       || "",
      phone:       s.phone       || "",
      dob:         (s.dob        || "").slice(0,10),
      gender:      s.gender      || "",
      major:       s.major       || "",
      yearOfStudy: s.yearOfStudy || "",
      address:     s.address     || "",
      status:      s.status      || "Active",
      enrolled:    (s.enrolled   || s.enrolled_at || "").slice(0,10),
    });
    setAvatarPreview(s.avatar_url || null);
    setAvatarFile(null);
    setModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.firstName || !form.email) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/students/${editing.id}`, form);
        let updated = { ...editing, ...form };
        if (avatarFile) {
          const fd = new FormData();
          fd.append("avatar", avatarFile);
          const res = await api.post(`/students/${editing.id}/avatar`, fd, { headers: { "Content-Type": "multipart/form-data" } });
          updated.avatar_url = res.data.avatar_url;
        }
        setStudents(students.map(s => s.id === editing.id ? updated : s));
        setModal(false);
      } else {
        const password = "Stu@" + Math.random().toString(36).slice(-6).toUpperCase();
        const res = await api.post("/students", { ...form, name: `${form.firstName} ${form.lastName}`, password });
        const newStudent = { id: res.data.id, ...form };
        if (avatarFile) {
          const fd = new FormData();
          fd.append("avatar", avatarFile);
          const avRes = await api.post(`/students/${res.data.id}/avatar`, fd, { headers: { "Content-Type": "multipart/form-data" } });
          newStudent.avatar_url = avRes.data.avatar_url;
        }
        setStudents([...students, newStudent]);
        setModal(false);
        setNewCreds({ email: form.email, password });
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    await api.delete(`/students/${id}`);
    setStudents(students.filter(s => s.id !== id));
  };

  return (
    <div>
      <PageHeader title="Student Management" sub={`${students.length} enrolled students`}
        action={canEdit ? <Btn onClick={openAdd} icon="plus" label="Add Student" /> : null} />

      <Card p={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search by name, email, admission no…" />
          <span style={{ fontSize: 12, color: "var(--sub)" }}>{filtered.length} results</span>
        </div>
        <Table
          cols={[
            { key: "firstName", label: "Student", render: (_, r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AvatarImg url={r.avatar_url} name={`${r.firstName} ${r.lastName}`} />
                <div>
                  <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                  <div style={{ fontSize: 11, color: "var(--sub)" }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: "major", label: "Major" },
            { key: "yearOfStudy", label: "Year" },
            { key: "status", label: "Status", render: v => <Badge status={v} /> },
          ]}
          rows={filtered}
          actions={row => (
            <div style={{ display: "flex", gap: 4 }}>
              <Btn onClick={() => setViewItem(row)} icon="eye" label="" small variant="ghost" />
              {canEdit && <>
                <Btn onClick={() => openEdit(row)} icon="edit" label="" small variant="ghost" />
                <Btn onClick={() => remove(row.id)} icon="trash" label="" small variant="danger" />
              </>}
            </div>
          )}
        />
      </Card>

      {/* ADD / EDIT MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Student Record" : "Add New Student"} size="lg">

        {/* AVATAR UPLOAD */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current.click()}>
            {avatarPreview
              ? <img src={avatarPreview.startsWith("blob") ? avatarPreview : (avatarPreview.startsWith("http") ? avatarPreview : API + avatarPreview)}
                  alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)" }} />
              : <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--hover)", border: "2px dashed var(--border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 24 }}>📷</span>
                  <span style={{ fontSize: 10, color: "var(--sub)", marginTop: 2 }}>Upload Photo</span>
                </div>
            }
            <div style={{ position: "absolute", bottom: 2, right: 2, background: "var(--text)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--card)", fontSize: 12 }}>✎</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        <SectionLabel>Personal Information</SectionLabel>
        <FormGrid>
          <Field label="First Name" value={form.firstName} onChange={set("firstName")} required />
          <Field label="Last Name" value={form.lastName} onChange={set("lastName")} required />
          <Field label="Gender" type="select" value={form.gender} onChange={set("gender")} options={["Male","Female","Other"]} />
          <Field label="Date of Birth" type="date" value={form.dob} onChange={set("dob")} />
          <Field label="Major / Subject" value={form.major} onChange={set("major")} placeholder="e.g. Computer Science" />
          <Field label="Year of Study" type="select" value={form.yearOfStudy} onChange={set("yearOfStudy")} options={["Year 1","Year 2","Year 3","Year 4","Year 5"]} />
          <Field label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="555-0000" />
          <Field label="Email Address" type="email" value={form.email} onChange={set("email")} required />
          <Field label="Address" value={form.address} onChange={set("address")} placeholder="Street, City, State" />
        </FormGrid>

        <SectionLabel>Academic Information</SectionLabel>
        <FormGrid>
          <Field label="Status" type="select" value={form.status} onChange={set("status")} options={["Active","Inactive"]} />
        </FormGrid>


        <FormActions onCancel={() => setModal(false)} onSave={save} saveLabel={saving ? "Saving…" : editing ? "Update Student" : "Add Student"} />
      </Modal>

      {/* VIEW MODAL */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Student Profile" size="md">
        {viewItem && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: 16, background: "var(--hover)", borderRadius: 10 }}>
              <AvatarImg url={viewItem.avatar_url} name={`${viewItem.firstName} ${viewItem.lastName}`} size={60} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{viewItem.firstName} {viewItem.lastName}</div>
                <div style={{ fontSize: 13, color: "var(--sub)" }}>{viewItem.email}</div>
                <div style={{ marginTop: 4 }}><Badge status={viewItem.status} /></div>
              </div>
            </div>
            <FormGrid>
              {[
                ["Major", viewItem.major || "—"],
                ["Year of Study", viewItem.yearOfStudy || "—"],
                ["Phone", viewItem.phone],
                ["DOB", viewItem.dob],
                ["Gender", viewItem.gender],

                ["Address", viewItem.address],

              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{v || "—"}</div>
                </div>
              ))}
            </FormGrid>
          </div>
        )}
      </Modal>

      {/* NEW CREDENTIALS MODAL */}
      <Modal open={!!newCreds} onClose={() => setNewCreds(null)} title="Student Account Created" size="sm">
        {newCreds && (
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
            <p style={{ color: "var(--sub)", marginBottom: 20 }}>Share these login credentials with the student:</p>
            <div style={{ background: "var(--hover)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", marginBottom: 4 }}>Email</div>
              <div style={{ fontWeight: 700, color: "var(--text)" }}>{newCreds.email}</div>
            </div>
            <div style={{ background: "var(--hover)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", marginBottom: 4 }}>Password</div>
              <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 22, letterSpacing: 3 }}>{newCreds.password}</div>
            </div>
            <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>⚠️ Save this password — it won't be shown again.</p>
            </div>
            <Btn onClick={() => setNewCreds(null)} label="Done" style={{ width: "100%" }} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsPage;