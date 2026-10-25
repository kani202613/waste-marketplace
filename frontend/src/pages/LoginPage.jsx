// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { 
        email: email.trim().toLowerCase(), 
        password 
      });
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
      console.error("Login error:", err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Unable to connect to the server. Please check your network.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Password@123");
    setMessage("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">♻️</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage waste trading & sustainable recycling</p>
        </div>

        {message && (
          <div className="auth-alert error">
            <span>⚠️</span>
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              autoComplete="email"
              className="auth-input"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="auth-input"
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
          >
            {loading ? "Signing in..." : "Sign In to Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create an Account
          </Link>
        </p>

        {/* DEMO ACCOUNTS QUICK FILL */}
        <div className="demo-accounts-box">
          <p className="demo-accounts-title">🔑 Quick Demo Logins:</p>
          <div className="demo-accounts-grid">
            <button
              type="button"
              onClick={() => handleQuickLogin("john@seller.com")}
              className="demo-btn"
            >
              📦 John (Seller)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("alex@collector.com")}
              className="demo-btn"
            >
              🚚 Alex (Collector)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
