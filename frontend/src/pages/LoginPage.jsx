// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
      setAuthToken(token);

      if (user.role === "seller") {
        navigate("/seller");
      } else {
        navigate("/buyer");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword("Password@123");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">♻️</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage waste trading & pick-ups</p>
        </div>

        {message && (
          <div style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            background: "#fef2f2",
            color: "#991b1b",
            borderRadius: "0.75rem",
            fontSize: "0.8125rem",
            fontWeight: "600",
            border: "1px solid #fecaca"
          }}>
            ⚠️ {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
          >
            {loading ? "Signing in..." : "Sign In to Account"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#059669", fontWeight: "700", textDecoration: "none" }}>
            Create an Account
          </Link>
        </p>

        {/* DEMO ACCOUNTS QUICK FILL */}
        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px dashed #e2e8f0",
          fontSize: "0.75rem",
          color: "#64748b"
        }}>
          <p style={{ fontWeight: "700", marginBottom: "0.6rem", color: "#334155" }}>🔑 Quick Fill Demo Accounts:</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("john@seller.com", "seller")}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "0.75rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              📦 Seller Account
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("alex@collector.com", "collector")}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "0.75rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🚚 Collector Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
