// src/components/layout/Sidebar.jsx
import { useState } from "react";
import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",      icon: "home",      roles: ["Admin","Teacher","Student","Staff"] },
  { id: "students",   label: "Students",        icon: "users",     roles: ["Admin","Teacher","Staff"] },
  { id: "teachers",   label: "Teachers",        icon: "user",      roles: ["Admin","Staff"] },
  { id: "staff",      label: "Staff",           icon: "briefcase", roles: ["Admin"] },
  { id: "courses",    label: "Courses",         icon: "book",      roles: ["Admin","Teacher","Student"] },
  { id: "videos",     label: "Video Learning",  icon: "video",     roles: ["Admin","Teacher","Student"] },
  { id: "payments",   label: "Payments",        icon: "credit",    roles: ["Admin","Staff"] },
  { id: "notes",      label: "Notes",           icon: "note",      roles: ["Admin","Teacher","Student"] },
  { id: "attendance", label: "Attendance",      icon: "list",      roles: ["Admin","Teacher","Staff"] },
  { id: "reports",    label: "Reports",         icon: "chart",     roles: ["Admin","Staff"] },
  { id: "settings",   label: "Settings",        icon: "settings",  roles: ["Admin","Teacher","Student","Staff"] },
];

const LogoutConfirm = ({ onConfirm, onCancel }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={onCancel} />
    <div style={{ position: "relative", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 28px 22px", width: 320, boxShadow: "0 8px 40px rgba(0,0,0,.18)", textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icon n="logout" s={22} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Log out?</div>
      <div style={{ fontSize: 13, color: "var(--sub)", marginBottom: 24 }}>Are you sure you want to log out of your account?</div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel}
          style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--hover)", color: "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={onConfirm}
          style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Yes, Log out
        </button>
      </div>
    </div>
  </div>
);

const Sidebar = ({ page, setPage, user, onLogout, collapsed, setCollapsed }) => {
  const [showLogout, setShowLogout] = useState(false);
  const nav = NAV_ITEMS.filter(n => n.roles.includes(user.role));

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--sidebar)", borderRight: "1px solid var(--border)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid var(--border)", minHeight: 60 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 45, height: 45, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                <img src="dist/assets/logo-DRNA-Csi.png" alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "'DM Serif Display',serif" }}>
                CodenestX
              </span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 4, marginLeft: collapsed ? "auto" : 0 }}>
            <Icon n="menu" s={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} title={collapsed ? item.label : ""}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, marginBottom: 2, border: "none", cursor: "pointer", textAlign: "left",
                background: page === item.id ? "var(--navActive)" : "transparent",
                color: page === item.id ? "var(--text)" : "var(--sub)",
                fontWeight: page === item.id ? 700 : 500, fontSize: 13 }}>
              <Icon n={item.icon} s={18} />
              {!collapsed && item.label}
            </button>
          ))}
        </nav>

        {/* Bottom user + logout */}
        <div style={{ padding: 10, borderTop: "1px solid var(--border)" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 9, marginBottom: 6, background: "var(--hover)" }}>
              
            </div>
          )}
          <button onClick={() => setShowLogout(true)} title="Logout"
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "var(--sub)", fontSize: 13, fontWeight: 600 }}>
            <Icon n="logout" s={18} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>

      {showLogout && (
        <LogoutConfirm
          onConfirm={() => { setShowLogout(false); onLogout(); }}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
};

export default Sidebar;