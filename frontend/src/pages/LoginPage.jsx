// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, user } = res.data;

      // Save token + user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role); // ⭐ add this
      setAuthToken(token);

      setMessage(`Welcome, ${user.name}!`);

      // ⭐ Redirect based on role
      if (user.role === "seller") {
        navigate("/seller");
      } else {
        // buyer / collector / others → buyer dashboard
        navigate("/buyer"); // ⭐ changed from /seller to /buyer
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Login failed. Try again.");
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
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          width: "320px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
          Waste Market Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "4px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        <p style={{ marginTop: "12px", textAlign: "center", fontSize: "14px" }}>
          New user? <Link to="/register">Create an account</Link>
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

export default LoginPage;
