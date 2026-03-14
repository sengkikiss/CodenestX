// src/components/ui/Avatar.jsx
import { useState } from "react";

const API = "http://localhost:5000";

const Avatar = ({ name = "", size = 36, url = null }) => {
  const [err, setErr] = useState(false);

  if (url && !err) {
    const src = url.startsWith("http") ? url : API + url;
    return (
      <img src={src} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }} />
    );
  }

  const initials = name.split(" ").filter(Boolean).map(w => w[0]).join("").substring(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      backgroundColor: "var(--border)", color: "var(--sub)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size < 36 ? 11 : 13, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

export default Avatar;