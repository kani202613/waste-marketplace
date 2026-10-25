// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "seller",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Client-side validations
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setMessage({ text: "Please enter your name, email, and password.", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setMessage({ text: "Please provide a valid email address.", type: "error" });
      return;
    }

    if (form.password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        ...form,
        email: form.email.trim().toLowerCase(),
        name: form.name.trim()
      });
      setMessage({ text: res.data.message || "Account created successfully! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Register error:", err);
      if (err.response?.data?.message) {
        setMessage({ text: err.response.data.message, type: "error" });
      } else {
        setMessage({ text: "Registration failed. Please check your network connection.", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "480px" }}>
        <div className="auth-header">
          <div className="auth-logo">♻️</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join WasteSmart as a Seller or Recycling Collector</p>
        </div>

        {message.text && (
          <div className={`auth-alert ${message.type}`}>
            <span>{message.type === "success" ? "✅" : "⚠️"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* ROLE SELECTOR TABS */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === "seller" ? "active" : ""}`}
            onClick={() => handleRoleSelect("seller")}
          >
            📦 Waste Seller
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === "collector" ? "active" : ""}`}
            onClick={() => handleRoleSelect("collector")}
          >
            🚚 Recycler / Collector
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-form-group">
            <label className="auth-label">Full Name / Business Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe / Green Scrap Co"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              autoComplete="email"
              className="auth-input"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password * (Min 6 characters)</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="auth-form-group">
              <label className="auth-label">Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="auth-input"
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Chennai"
                className="auth-input"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem" }}>
            <div className="auth-form-group">
              <label className="auth-label">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Industrial Estate, Guindy"
                className="auth-input"
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Pincode</label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="600032"
                className="auth-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
