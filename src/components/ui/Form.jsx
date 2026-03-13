// src/components/ui/Form.jsx
// Shared form primitives: Field, FormGrid, SectionLabel, FormActions, SearchBar, Btn, Card, StatCard, PageHeader, Tabs

import Icon from "./Icon";

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
export const fieldStyle = {
  background: "var(--input)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--text)",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

export const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--sub)",
  marginBottom: 5,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: ".5px",
};

// ─── FIELD ────────────────────────────────────────────────────────────────────
/**
 * Universal form field: text | email | password | number | date | select | textarea
 * @param {number} span  - grid column span (1 or 2)
 */
export const Field = ({ label, type = "text", value, onChange, options, placeholder, required, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>

    {type === "select" ? (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle}>
        <option value="">— Select —</option>
        {(options || []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{ ...fieldStyle, resize: "vertical" }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={fieldStyle}
      />
    )}
  </div>
);

// ─── FORM GRID ────────────────────────────────────────────────────────────────
/** Responsive 2-column grid wrapper for form fields */
export const FormGrid = ({ children, cols = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px 20px" }}>
    {children}
  </div>
);

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
/** Divides form into labelled sections */
export const SectionLabel = ({ children }) => (
  <div
    style={{
      fontSize: 12, fontWeight: 700, color: "var(--sub)",
      textTransform: "uppercase", letterSpacing: 1,
      padding: "16px 0 8px",
      borderBottom: "1px solid var(--border)",
      marginBottom: 16,
    }}
  >
    {children}
  </div>
);

// ─── FORM ACTIONS ─────────────────────────────────────────────────────────────
export const FormActions = ({ onCancel, onSave, saveLabel = "Save" }) => (
  <div
    style={{
      display: "flex", justifyContent: "flex-end", gap: 10,
      marginTop: 24, paddingTop: 16,
      borderTop: "1px solid var(--border)",
    }}
  >
    <button
      onClick={onCancel}
      style={{
        padding: "8px 20px", borderRadius: 8,
        border: "1px solid var(--border)",
        background: "transparent", color: "var(--text)",
        cursor: "pointer", fontSize: 13, fontWeight: 600,
      }}
    >
      Cancel
    </button>
    <button
      onClick={onSave}
      style={{
        padding: "8px 20px", borderRadius: 8,
        border: "none",
        background: "var(--text)", color: "var(--card)",
        cursor: "pointer", fontSize: 13, fontWeight: 600,
      }}
    >
      {saveLabel}
    </button>
  </div>
);

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative" }}>
    <div
      style={{
        position: "absolute", left: 10, top: "50%",
        transform: "translateY(-50%)", color: "var(--sub)", pointerEvents: "none",
      }}
    >
      <Icon n="search" s={15} />
    </div>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search…"}
      style={{ ...fieldStyle, paddingLeft: 34, width: 260 }}
    />
  </div>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
const BTN_VARIANTS = {
  primary: { background: "var(--text)", color: "var(--card)", border: "none" },
  ghost:   { background: "transparent", color: "var(--sub)", border: "1px solid var(--border)" },
  danger:  { background: "transparent", color: "#ef4444", border: "1px solid #fecaca" },
};

export const Btn = ({ onClick, icon, label, variant = "primary", small = false }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: small ? "5px 10px" : "8px 16px",
      borderRadius: 8, cursor: "pointer",
      fontSize: small ? 12 : 13, fontWeight: 600,
      ...BTN_VARIANTS[variant],
    }}
  >
    {icon && <Icon n={icon} s={small ? 13 : 15} />}
    {label}
  </button>
);

// ─── CARD ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, p = 20, style = {} }) => (
  <div
    style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: p,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, icon }) => (
  <Card>
    <div style={{ marginBottom: 12 }}>
      <div style={{ padding: 8, borderRadius: 8, background: "var(--hover)", color: "var(--sub)", width: "fit-content" }}>
        <Icon n={icon} s={18} />
      </div>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>
      {value}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--sub)" }}>{sub}</div>}
  </Card>
);

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 13, color: "var(--sub)", margin: "3px 0 0" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── TABS ─────────────────────────────────────────────────────────────────────
export const Tabs = ({ tabs, active, onChange }) => (
  <div
    style={{
      display: "flex", gap: 4, padding: 5,
      background: "var(--hover)", borderRadius: 10,
      width: "fit-content", marginBottom: 20,
    }}
  >
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        style={{
          padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600,
          background: active === t.id ? "var(--card)" : "transparent",
          color: active === t.id ? "var(--text)" : "var(--sub)",
          boxShadow: active === t.id ? "0 1px 4px rgba(0,0,0,.08)" : "none",
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);
