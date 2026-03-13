// src/components/ui/Avatar.jsx
// Renders initials-based circular avatar using CSS variables for theming.

/**
 * @param {string} name  - full name string, e.g. "Alice Johnson"
 * @param {number} size  - diameter in px (default 36)
 */
const Avatar = ({ name = "", size = 36 }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "var(--border)",
        color: "var(--sub)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size < 36 ? 11 : 13,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
