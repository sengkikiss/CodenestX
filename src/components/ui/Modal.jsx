// src/components/ui/Modal.jsx
// Overlay modal with scroll support. Sizes: sm | md | lg | xl

import Icon from "./Icon";

const SIZE_MAP = { sm: 420, md: 600, lg: 820, xl: 1020 };

/**
 * @param {boolean}  open     - controls visibility
 * @param {function} onClose  - called when X or backdrop clicked
 * @param {string}   title    - header text
 * @param {string}   size     - "sm" | "md" | "lg" | "xl"
 */
const Modal = ({ open, onClose, title, children, size = "md" }) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(0,0,0,.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Stop click propagation so inner clicks don't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: SIZE_MAP[size],
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          boxShadow: "0 24px 64px rgba(0,0,0,.25)",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{title}</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", padding: 4 }}
          >
            <Icon n="x" s={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
