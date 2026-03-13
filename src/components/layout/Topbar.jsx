// src/components/layout/Topbar.jsx
// Top navigation bar: date display, dark mode toggle, notification bell, user info.

import Icon from "../ui/Icon";
import Avatar from "../ui/Avatar";

const Topbar = ({ user, dark, setDark }) => (
  <div
    style={{
      background: "var(--card)", borderBottom: "1px solid var(--border)",
      padding: "0 24px", height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0,
    }}
  >
    {/* Date */}
    <div style={{ fontSize: 13, color: "var(--sub)" }}>
      {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
    </div>

    {/* Controls */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* Dark mode toggle */}
      <button
        onClick={() => setDark(!dark)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6, borderRadius: 8 }}
      >
        <Icon n={dark ? "sun" : "moon"} s={17} />
      </button>

      {/* Notification bell */}
      <button
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 6, borderRadius: 8, position: "relative" }}
      >
        <Icon n="bell" s={17} />
        <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
      </button>

      {/* User info */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar name={user.name} size={32} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{user.name}</div>
          <div style={{ fontSize: 11, color: "var(--sub)" }}>{user.role}</div>
        </div>
      </div>
    </div>
  </div>
);

export default Topbar;
