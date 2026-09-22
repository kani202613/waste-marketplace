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

  return (
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">♻️</div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to manage waste trading & pick-ups</p>
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
          <div class="auth-form-group">
            <label class="auth-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              class="auth-input"
            />
          </div>

          <div class="auth-form-group">
            <label class="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              class="auth-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            class="auth-btn"
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

        {/* DEMO ACCOUNTS HELPER */}
        <div style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px border-dash #e2e8f0",
          fontSize: "0.75rem",
          color: "#64748b"
        }}>
          <p style={{ fontWeight: "700", marginBottom: "0.4rem", color: "#334155" }}>🔑 Quick Demo Accounts:</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span><strong>Seller:</strong> john@seller.com</span>
            <span>Password@123</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.2rem" }}>
            <span><strong>Collector:</strong> alex@collector.com</span>
            <span>Password@123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
