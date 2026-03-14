// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import Avatar from "../components/ui/Avatar";
import { Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const inp = {
  width: "100%", boxSizing: "border-box",
  background: "var(--input)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13,
  color: "var(--text)", outline: "none"
};
const lbl = { fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", display: "block", marginBottom: 5 };

const TABS = [
  { id: "profile",       label: "Profile" },
  { id: "security",      label: "Security" },
  { id: "appearance",    label: "Appearance" },
  { id: "notifications", label: "Notifications" },
];

const Toast = ({ msg, type }) => msg ? (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, padding: "12px 20px", borderRadius: 10,
    background: type === "error" ? "#fee2e2" : "#d1fae5",
    color: type === "error" ? "#ef4444" : "#10b981",
    border: "1px solid " + (type === "error" ? "#fca5a5" : "#6ee7b7"),
    fontWeight: 600, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,.12)" }}>
    {msg}
  </div>
) : null;

const SettingsPage = ({ user, dark, setDark, setUser }) => {
  const [tab, setTab] = useState("profile");

  // Profile state
  const [name, setName]   = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.post("/auth/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAvatarUrl(res.data.avatar_url);
      const updated = { ...user, avatar_url: res.data.avatar_url };
      localStorage.setItem("user", JSON.stringify(updated));
      if (setUser) setUser(updated);
      showToast("Avatar updated successfully");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to upload avatar", "error");
    }
    setAvatarUploading(false);
  };

  // Fetch fresh profile from API on mount
  useEffect(() => {
    api.get("/auth/me").then(res => {
      setName(res.data.name || "");
      setEmail(res.data.email || "");
      setAvatarUrl(res.data.avatar_url || null);
    }).catch(() => {});
  }, []);

  // Password state
  const [curPwd, setCurPwd]     = useState("");
  const [newPwd, setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving]   = useState(false);
  const [showCur, setShowCur]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [showCon, setShowCon]   = useState(false);

  // Notifications state
  const [notif, setNotif] = useState({
    emailNotif: true, smsNotif: false, weeklyReport: true,
    paymentAlert: true, attendanceAlert: false, examReminder: true
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) return showToast("Name and email are required", "error");
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", { name, email });
      // Update stored user
      const updated = { ...user, name, email };
      localStorage.setItem("user", JSON.stringify(updated));
      if (setUser) setUser(updated);
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update profile", "error");
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!curPwd || !newPwd || !confirmPwd) return showToast("All fields are required", "error");
    if (newPwd !== confirmPwd) return showToast("New passwords do not match", "error");
    if (newPwd.length < 6) return showToast("Password must be at least 6 characters", "error");
    setPwdSaving(true);
    try {
      await api.put("/auth/password", { currentPassword: curPwd, newPassword: newPwd });
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
      showToast("Password changed successfully");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to change password", "error");
    }
    setPwdSaving(false);
  };

  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick}
      style={{ width: 44, height: 24, borderRadius: 12, border: "none",
        background: on ? "#6366f1" : "var(--border)", cursor: "pointer",
        position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3,
        left: on ? "calc(100% - 21px)" : 3, width: 18, height: 18,
        borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
    </button>
  );

  const PwdField = ({ label, value, onChange, show, setShow }) => (
    <div>
      <label style={lbl}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          style={{ ...inp, paddingRight: 42 }} />
        <button onClick={() => setShow(!show)}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--sub)", fontSize: 12, fontWeight: 600 }}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Settings" sub="Manage your account and system preferences" />

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              color: tab === t.id ? "var(--text)" : "var(--sub)",
              borderBottom: tab === t.id ? "2px solid var(--text)" : "2px solid transparent",
              marginBottom: -1, transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <Card>
          {/* Avatar section */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
            <div style={{ position: "relative" }}>
              <Avatar name={name || user?.name} url={avatarUrl} size={80} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%",
                background: "var(--text)", color: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, border: "2px solid var(--card)", cursor: "pointer" }}
                onClick={() => document.getElementById("avatar-upload").click()}>
                {avatarUploading ? "…" : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                )}
              </div>
              <input id="avatar-upload" type="file" accept="image/*" capture="user" style={{ display: "none" }} onChange={uploadAvatar} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{name || user?.name}</div>
              <div style={{ fontSize: 13, color: "var(--sub)", marginTop: 2 }}>{email || user?.email}</div>
              <div style={{ marginTop: 6, display: "inline-block", padding: "2px 10px", borderRadius: 99, background: "var(--hover)", fontSize: 11, fontWeight: 700, color: "var(--sub)" }}>
                {user?.role}
              </div>
              <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 6 }}>Click camera icon to take or upload a photo</div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Personal Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="Your name" />
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="your@email.com" type="email" />
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving}
            style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--text)", color: "var(--card)", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save Profile Changes"}
          </button>
        </Card>
      )}

      {/* SECURITY TAB */}
      {tab === "security" && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Change Password</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
            <PwdField label="Current Password"  value={curPwd}     onChange={setCurPwd}     show={showCur} setShow={setShowCur} />
            <PwdField label="New Password"       value={newPwd}     onChange={setNewPwd}     show={showNew} setShow={setShowNew} />
            <PwdField label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd} show={showCon} setShow={setShowCon} />

            {newPwd && confirmPwd && newPwd !== confirmPwd && (
              <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>Passwords do not match</div>
            )}
            {newPwd && newPwd.length < 6 && (
              <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>Password must be at least 6 characters</div>
            )}

            <button onClick={changePassword} disabled={pwdSaving}
              style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--text)", color: "var(--card)", fontWeight: 700, fontSize: 13, cursor: pwdSaving ? "not-allowed" : "pointer", opacity: pwdSaving ? 0.7 : 1, alignSelf: "flex-start", marginTop: 4 }}>
              {pwdSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </Card>
      )}

      {/* APPEARANCE TAB */}
      {tab === "appearance" && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Appearance</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 2 }}>Switch between light and dark theme</div>
            </div>
            <Toggle on={dark} onClick={() => setDark(!dark)} />
          </div>
        </Card>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab === "notifications" && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>Notification Preferences</div>
          {[
            { key: "emailNotif",      label: "Email Notifications",    sub: "Receive updates via email" },
            { key: "smsNotif",        label: "SMS Notifications",      sub: "Receive text message alerts" },
            { key: "paymentAlert",    label: "Payment Alerts",         sub: "Get notified on new payments" },
            { key: "attendanceAlert", label: "Attendance Alerts",      sub: "Daily attendance summary" },
            { key: "weeklyReport",    label: "Weekly Report",          sub: "Receive weekly performance report" },
            { key: "examReminder",    label: "Exam Reminders",         sub: "Reminders before upcoming exams" },
          ].map(item => (
            <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 2 }}>{item.sub}</div>
              </div>
              <Toggle on={notif[item.key]} onClick={() => setNotif(n => ({ ...n, [item.key]: !n[item.key] }))} />
            </div>
          ))}
          <button onClick={() => showToast("Notification preferences saved")}
            style={{ marginTop: 20, padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--text)", color: "var(--card)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Save Preferences
          </button>
        </Card>
      )}

      <Toast msg={toast?.msg} type={toast?.type} />
    </div>
  );
};

export default SettingsPage;