// src/components/ui/Table.jsx
// Reusable data table with hover rows and optional actions column.

/**
 * @param {Array}    cols     - [{ key, label, render? }]
 * @param {Array}    rows     - array of data objects
 * @param {function} actions  - (row) => JSX  — renders action buttons per row
 */
const Table = ({ cols, rows, actions }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {cols.map((c) => (
            <th
              key={c.key}
              style={{
                textAlign: "left", padding: "10px 14px",
                color: "var(--sub)", fontWeight: 700,
                fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6,
                borderBottom: "1px solid var(--border)",
              }}
            >
              {c.label}
            </th>
          ))}
          {actions && (
            <th
              style={{
                textAlign: "right", padding: "10px 14px",
                color: "var(--sub)", fontWeight: 700,
                fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6,
                borderBottom: "1px solid var(--border)",
              }}
            >
              Actions
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.id ?? i}
            style={{ borderBottom: "1px solid var(--borderLight)", transition: "background .1s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {cols.map((c) => (
              <td
                key={c.key}
                style={{ padding: "11px 14px", color: "var(--text)", verticalAlign: "middle" }}
              >
                {c.render ? c.render(row[c.key], row) : row[c.key]}
              </td>
            ))}
            {actions && (
              <td style={{ padding: "11px 14px", textAlign: "right" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                  {actions(row)}
                </div>
              </td>
            )}
          </tr>
        ))}

        {rows.length === 0 && (
          <tr>
            <td
              colSpan={cols.length + (actions ? 1 : 0)}
              style={{ textAlign: "center", padding: 40, color: "var(--sub)", fontSize: 13 }}
            >
              No records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default Table;
