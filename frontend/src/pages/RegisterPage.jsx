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

  const [message, setMessage] = useState("");
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
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      setMessage(res.data.message || "Account created successfully!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Registration failed. Please check your details.");
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

        {message && (
          <div style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            background: message.includes("success") || message.includes("created") ? "#ecfdf5" : "#fef2f2",
            color: message.includes("success") || message.includes("created") ? "#047857" : "#991b1b",
            borderRadius: "0.75rem",
            fontSize: "0.8125rem",
            fontWeight: "600",
            border: "1px solid #a7f3d0"
          }}>
            {message.includes("success") || message.includes("created") ? "✅ " : "⚠️ "}{message}
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

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Full Name / Company Name</label>
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
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              className="auth-input"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="auth-input"
            />
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

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#059669", fontWeight: "700", textDecoration: "none" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
