// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { DEMO_USERS } from "../data/mockData";

const fieldStyle = {
  background: "var(--input)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--text)",
  width: "100%",
  outline: "none",
  boxSizing: "border-box"
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--sub)",
  marginBottom: 5,
  display: "block",
  textTransform: "uppercase",
  letterSpacing: ".5px"
};

const Login = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@school.edu");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setErr("");

    try {
      const result = await login(email, password);

      if (!result.success) {
        setErr(result.error || "Login failed");
      }
    } catch (e) {
      setErr("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 16
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
           //   background: "var(--text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px"
            }}
          >
            {/* FIXED IMAGE PATH */}
            <img src="src/logo.png" alt="CodenestX Academy Logo" width="95" />
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--text)",
              margin: 0,
              fontFamily: "'DM Serif Display',serif"
            }}
          >
            School Management System
          </h1>

          <p style={{ fontSize: 13, color: "var(--sub)", marginTop: 4 }}>
            Welcome back
          </p>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 32
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 24
            }}
          >
            Sign in to your account
          </h2>

          {err && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#991b1b",
                fontSize: 13,
                marginBottom: 16
              }}
            >
              {err}
            </div>
          )}

          {/* EMAIL */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Email Address <span style={{ color: "#ef4444" }}>*</span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@school.edu"
              style={fieldStyle}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Password <span style={{ color: "#ef4444" }}>*</span>
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={fieldStyle}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "var(--text)",
              color: "var(--card)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {/* DEMO USERS */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--border)"
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "var(--sub)",
                marginBottom: 10,
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: 0.5
              }}
            >
             
            </p>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;