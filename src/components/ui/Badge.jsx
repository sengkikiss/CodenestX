// src/components/ui/Badge.jsx
// Colored pill badge for status fields.

const STATUS_STYLES = {
  Active:    { background: "#dcfce7", color: "#166534" },
  Inactive:  { background: "#fee2e2", color: "#991b1b" },
  Paid:      { background: "#dcfce7", color: "#166534" },
  Pending:   { background: "#fef9c3", color: "#854d0e" },
  Overdue:   { background: "#fee2e2", color: "#991b1b" },
  Permanent: { background: "#dbeafe", color: "#1e40af" },
  Contract:  { background: "#ede9fe", color: "#5b21b6" },
  "Part-time":{ background: "#fef3c7", color: "#92400e" },
};

/**
 * @param {string} status - e.g. "Active", "Paid", "Pending"
 */
const Badge = ({ status }) => {
  const style = STATUS_STYLES[status] || { background: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        ...style,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

export default Badge;
