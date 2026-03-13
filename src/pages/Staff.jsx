// src/pages/Staff.jsx
import { useState, useRef } from "react";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import { Field, FormGrid, SectionLabel, FormActions, SearchBar, Btn, Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const API = "http://localhost:5000";
const today = () => new Date().toISOString().split("T")[0];
const fmtMoney = (v) => `$${Number(v || 0).toLocaleString()}`;

const BLANK_STF = {
  firstName: "", lastName: "", email: "", phone: "", dob: "", gender: "",
  role: "", department: "", employeeId: "", address: "", emergencyContact: "",
  salary: "", joinDate: today(), status: "Active", shift: "Morning", contractType: "Permanent"
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

const StaffPage = ({ staff, setStaff, role }) => {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [newCreds, setNewCreds] = useState(null);
  const [form, setForm] = useState(BLANK_STF);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const canEdit = role === "Admin";

  const filtered = staff.filter(s =>
    `${s.firstName} ${s.lastName} ${s.role} ${s.department} ${s.employeeId}`.toLowerCase().includes(q.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...BLANK_STF, employeeId: `STF-${String(staff.length + 1).padStart(3, "0")}`, joinDate: today() });
    setAvatarPreview(null);
    setAvatarFile(null);
    setModal(true);
  };

  const openEdit = s => {
    setEditing(s);
    const clean = {};
    Object.keys(BLANK_STF).forEach(k => { clean[k] = s[k] ?? ""; });
    setForm(clean);
    setAvatarPreview(s.avatar_url ? (s.avatar_url.startsWith("http") ? s.avatar_url : API + s.avatar_url) : null);
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
        await api.put(`/staff/${editing.id}`, form);
        let updated = { ...editing, ...form };
        if (avatarFile) {
          const fd = new FormData();
          fd.append("avatar", avatarFile);
          const res = await api.post(`/staff/${editing.id}/avatar`, fd, { headers: { "Content-Type": "multipart/form-data" } });
          updated.avatar_url = res.data.avatar_url;
        }
        setStaff(staff.map(s => s.id === editing.id ? updated : s));
        setModal(false);
      } else {
        const password = "Stf@" + Math.random().toString(36).slice(-6).toUpperCase();
        const res = await api.post("/staff", { ...form, name: `${form.firstName} ${form.lastName}`, password });
        const newStaff = { id: res.data.id, ...form };
        if (avatarFile) {
          const fd = new FormData();
          fd.append("avatar", avatarFile);
          const avRes = await api.post(`/staff/${res.data.id}/avatar`, fd, { headers: { "Content-Type": "multipart/form-data" } });
          newStaff.avatar_url = avRes.data.avatar_url;
        }
        setStaff([...staff, newStaff]);
        setModal(false);
        setNewCreds({ email: form.email, password });
      }
      const r = await api.get("/staff");
      setStaff(r.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    await api.delete(`/staff/${id}`);
    setStaff(staff.filter(s => s.id !== id));
  };

  return (
    <div>
      <PageHeader title="Staff Management" sub={`${staff.length} staff members`}
        action={canEdit ? <Btn onClick={openAdd} icon="plus" label="Add Staff" /> : null} />

      <Card p={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <SearchBar value={q} onChange={setQ} placeholder="Search staff…" />
          <span style={{ fontSize: 12, color: "var(--sub)" }}>{filtered.length} results</span>
        </div>
        <Table
          cols={[
            { key: "firstName", label: "Name", render: (_, r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AvatarImg url={r.avatar_url} name={`${r.firstName} ${r.lastName}`} />
                <div>
                  <div style={{ fontWeight: 600 }}>{r.firstName} {r.lastName}</div>
                  <div style={{ fontSize: 11, color: "var(--sub)" }}>{r.email}</div>
                </div>
              </div>
            )},
            { key: "employeeId", label: "Emp. ID", render: v => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{v}</span> },
            { key: "role", label: "Role" },
            { key: "department", label: "Department" },
            { key: "shift", label: "Shift" },
            { key: "contractType", label: "Contract", render: v => <Badge status={v} /> },
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
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Staff Record" : "Add New Staff"} size="lg">

        {/* AVATAR */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current.click()}>
            {avatarPreview
              ? <img src={avatarPreview} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)" }} />
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
          <Field label="Email Address" type="email" value={form.email} onChange={set("email")} required />
          <Field label="Phone Number" value={form.phone} onChange={set("phone")} />
          <Field label="Date of Birth" type="date" value={form.dob} onChange={set("dob")} />
          <Field label="Gender" type="select" value={form.gender} onChange={set("gender")} options={["", "Male", "Female", "Other"]} />
          <Field label="Home Address" value={form.address} onChange={set("address")} />
          <Field label="Emergency Contact" value={form.emergencyContact} onChange={set("emergencyContact")} />
        </FormGrid>

        <SectionLabel>Employment Information</SectionLabel>
        <FormGrid>
          <Field label="Employee ID" value={form.employeeId} onChange={set("employeeId")} placeholder="STF-001" />
          <Field label="Join Date" type="date" value={form.joinDate} onChange={set("joinDate")} />
          <Field label="Role / Position" value={form.role} onChange={set("role")} placeholder="e.g. Administrator" required />
          <Field label="Department" type="select" value={form.department} onChange={set("department")} options={["", "Administration", "Security", "Library", "Maintenance", "Canteen", "IT Support"]} />
          <Field label="Shift" type="select" value={form.shift} onChange={set("shift")} options={["Morning", "Afternoon", "Evening", "Night"]} />
          <Field label="Monthly Salary ($)" type="number" value={form.salary} onChange={set("salary")} placeholder="3000" />
          <Field label="Contract Type" type="select" value={form.contractType} onChange={set("contractType")} options={["Permanent", "Contract", "Part-time"]} />
          <Field label="Status" type="select" value={form.status} onChange={set("status")} options={["Active", "Inactive"]} />
        </FormGrid>

        <FormActions onCancel={() => setModal(false)} onSave={save} saveLabel={saving ? "Saving…" : editing ? "Update Staff" : "Add Staff"} />
      </Modal>

      {/* VIEW MODAL */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Staff Profile" size="md">
        {viewItem && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: 16, background: "var(--hover)", borderRadius: 10 }}>
              <AvatarImg url={viewItem.avatar_url} name={`${viewItem.firstName} ${viewItem.lastName}`} size={60} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{viewItem.firstName} {viewItem.lastName}</div>
                <div style={{ fontSize: 13, color: "var(--sub)" }}>{viewItem.role} · {viewItem.department}</div>
                <div style={{ marginTop: 4 }}><Badge status={viewItem.status} /></div>
              </div>
            </div>
            <FormGrid>
              {[
                ["Employee ID", viewItem.employeeId],
                ["Email", viewItem.email],
                ["Phone", viewItem.phone],
                ["DOB", viewItem.dob],
                ["Gender", viewItem.gender],
                ["Shift", viewItem.shift],
                ["Salary", fmtMoney(viewItem.salary) + "/mo"],
                ["Contract", viewItem.contractType],
                ["Join Date", viewItem.joinDate],
                ["Address", viewItem.address],
                ["Emergency Contact", viewItem.emergencyContact],
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
      <Modal open={!!newCreds} onClose={() => setNewCreds(null)} title="Staff Account Created" size="sm">
        {newCreds && (
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👔</div>
            <p style={{ color: "var(--sub)", marginBottom: 20 }}>Share these login credentials with the staff member:</p>
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

export default StaffPage;