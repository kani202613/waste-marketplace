// src/pages/RegisterPage.js
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Registering...");

    try {
      const res = await api.post("/auth/register", form);
       setMessage(res.data.message || "Registered!");

      // after register, go to login
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Registration failed.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#e5e7eb",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          width: "380px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
          Create Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "8px" }}>
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            >
              <option value="seller">Seller</option>
              <option value="collector">Collector</option>
            </select>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>Pincode</label>
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "6px",
            }}
          >
            Register
          </button>
        </form>

        <p style={{ marginTop: "10px", textAlign: "center", fontSize: "14px" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>

        {message && (
          <p style={{ marginTop: "8px", textAlign: "center", color: "#444" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
