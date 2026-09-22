// src/pages/SellerDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "E-waste",
    approx_weight: "",
    base_price: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Load user + items + incoming requests
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userStr));
    fetchMyItems();
    fetchIncomingRequests();
  }, [navigate]);

  const fetchMyItems = async () => {
    try {
      const res = await api.get("/waste/my");
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching my items:", err);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const res = await api.get("/requests/seller");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching incoming requests:", err);
    }
  };

  const handleCategorySelect = (category) => {
    setForm({ ...form, category });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Creating waste item...");
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        category: form.category,
        weight: Number(form.approx_weight),
        basePrice: Number(form.base_price),
        address: form.address,
        city: form.city,
        pincode: form.pincode,
      };

      const res = await api.post("/waste", payload);
      setMessage(res.data.message || "Item listed successfully!");
      setTimeout(() => setMessage(""), 3000);

      setForm({
        title: "",
        category: "E-waste",
        approx_weight: "",
        base_price: "",
        address: "",
        city: "",
        pincode: "",
      });

      fetchMyItems();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error creating waste item.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    setMessage("Updating status...");
    try {
      const res = await api.put(`/requests/${requestId}`, { status });
      setMessage(res.data.message || "Status updated.");
      setTimeout(() => setMessage(""), 3000);
      fetchIncomingRequests();
      fetchMyItems();
    } catch (err) {
      console.error("Error updating request:", err);
      setMessage(err.response?.data?.message || "Failed to update status.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setAuthToken(null);
    navigate("/login");
  };

  const pendingRequestsCount = requests.filter(r => r.status === "PENDING").length;
  const acceptedRequestsCount = requests.filter(r => r.status === "ACCEPTED" || r.status === "COMPLETED").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-gradient)" }}>
      {/* NAVBAR */}
      <header class="app-navbar">
        <div class="brand-container">
          <div class="brand-icon">♻️</div>
          <div>
            <h1 class="brand-title">WasteSmart <span>Seller</span></h1>
          </div>
        </div>

        <div class="nav-actions">
          {user && (
            <div class="user-chip">
              <span class="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "S"}</span>
              <span>{user.name}</span>
              <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "#dcfce7", color: "#15803d", fontWeight: "700" }}>Seller</span>
            </div>
          )}
          <button onClick={handleLogout} class="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        
        {/* STATS OVERVIEW BAR */}
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-info">
              <p>Active Listed Items</p>
              <h2>{items.length}</h2>
            </div>
            <div class="stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>📦</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p>Pending Pick-Up Requests</p>
              <h2 style={{ color: "#d97706" }}>{pendingRequestsCount}</h2>
            </div>
            <div class="stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>📩</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p>Accepted / Deals Closed</p>
              <h2 style={{ color: "#2563eb" }}>{acceptedRequestsCount}</h2>
            </div>
            <div class="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>🤝</div>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {message && (
          <div style={{
            padding: "0.85rem 1.25rem",
            marginBottom: "1.5rem",
            background: "#ecfdf5",
            color: "#047857",
            borderRadius: "1rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            border: "1px solid #a7f3d0",
            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.1)"
          }}>
            ⚡ {message}
          </div>
        )}

        {/* DASHBOARD GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.75rem" }}>
          
          {/* LEFT: POST WASTE ITEM FORM */}
          <div style={{ background: "#ffffff", padding: "1.75rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "800", color: "#0f172a" }}>Post Scrap / Waste Material</h2>
              <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8125rem", color: "#64748b" }}>List items for verified recycling collectors</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div class="auth-form-group">
                <label class="auth-label">Listing Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Clean HDPE Bottles & E-Waste Boards"
                  required
                  class="auth-input"
                />
              </div>

              {/* CATEGORY VISUAL PILLS */}
              <div class="auth-form-group">
                <label class="auth-label">Select Category</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem" }}>
                  {[
                    { id: "E-waste", label: "⚡ E-waste" },
                    { id: "Plastic", label: "♻️ Plastic" },
                    { id: "Metal", label: "🔩 Metal" },
                    { id: "Paper", label: "📄 Paper" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      style={{
                        padding: "0.5rem 0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        borderRadius: "0.625rem",
                        border: "1px solid",
                        borderColor: form.category === cat.id ? "#059669" : "#cbd5e1",
                        background: form.category === cat.id ? "#ecfdf5" : "#ffffff",
                        color: form.category === cat.id ? "#059669" : "#64748b",
                        cursor: "pointer"
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div class="auth-form-group">
                  <label class="auth-label">Approx Weight (kg)</label>
                  <input
                    name="approx_weight"
                    type="number"
                    min="1"
                    value={form.approx_weight}
                    onChange={handleChange}
                    placeholder="150"
                    required
                    class="auth-input"
                  />
                </div>

                <div class="auth-form-group">
                  <label class="auth-label">Base Price (₹)</label>
                  <input
                    name="base_price"
                    type="number"
                    min="0"
                    value={form.base_price}
                    onChange={handleChange}
                    placeholder="2500"
                    required
                    class="auth-input"
                  />
                </div>
              </div>

              <div class="auth-form-group">
                <label class="auth-label">Street / Industrial Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Guindy Industrial Estate"
                  required
                  class="auth-input"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div class="auth-form-group">
                  <label class="auth-label">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    required
                    class="auth-input"
                  />
                </div>

                <div class="auth-form-group">
                  <label class="auth-label">Pincode</label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="600032"
                    required
                    class="auth-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                class="auth-btn"
                style={{ marginTop: "0.5rem" }}
              >
                {loading ? "Posting..." : "➕ List Waste Material"}
              </button>
            </form>
          </div>

          {/* RIGHT: INCOMING REQUESTS & MY ITEMS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            
            {/* INCOMING REQUESTS PANEL */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>📩 Incoming Pick-Up Requests</h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>Manage buyer collection requests</p>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "0.2rem 0.6rem", borderRadius: "9999px", background: "#fef3c7", color: "#92400e" }}>
                  {pendingRequestsCount} Pending
                </span>
              </div>

              {requests.length === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", textAlign: "center", padding: "1.5rem 0" }}>No incoming requests yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "280px", overflowY: "auto", paddingRight: "0.3rem" }}>
                  {requests.map((req) => (
                    <div key={req.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "0.875rem", color: "#0f172a" }}>{req.title}</strong>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "9999px",
                          background: req.status === "PENDING" ? "#fef3c7" : req.status === "ACCEPTED" ? "#dcfce7" : req.status === "COMPLETED" ? "#e0f2fe" : "#fee2e2",
                          color: req.status === "PENDING" ? "#92400e" : req.status === "ACCEPTED" ? "#166534" : req.status === "COMPLETED" ? "#075985" : "#991b1b",
                        }}>
                          {req.status}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        <span>Buyer: <strong style={{ color: "#334155" }}>{req.buyerName}</strong> ({req.buyerEmail})</span>
                        {req.buyerPhone && <span> • 📞 {req.buyerPhone}</span>}
                      </div>

                      {req.status === "PENDING" && (
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, "ACCEPTED")}
                            style={{ padding: "0.35rem 0.85rem", background: "#059669", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" }}
                          >
                            ✓ Accept Pick-Up
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, "REJECTED")}
                            style={{ padding: "0.35rem 0.85rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700" }}
                          >
                            ✕ Decline
                          </button>
                        </div>
                      )}

                      {req.status === "ACCEPTED" && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "COMPLETED")}
                          style={{ padding: "0.35rem 0.85rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", width: "fit-content", marginTop: "0.25rem" }}
                        >
                          🏁 Mark Picked Up / Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MY LISTED ITEMS PANEL */}
            <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)" }}>
              <div style={{ display: "flex", alignItems: "center", justify: "space-between", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>📋 My Active Listings</h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>Listings posted under your account</p>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "0.2rem 0.6rem", borderRadius: "9999px", background: "#ecfdf5", color: "#059669" }}>
                  {items.length} Active
                </span>
              </div>

              {items.length === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", textAlign: "center", padding: "1.5rem 0" }}>No waste items posted yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "280px", overflowY: "auto", paddingRight: "0.3rem" }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <strong style={{ fontSize: "0.875rem", color: "#0f172a" }}>{item.title}</strong>
                          <span class="category-chip" style={{ fontSize: "0.6875rem", padding: "0.15rem 0.5rem" }}>{item.category}</span>
                        </div>
                        <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                          {item.approx_weight} kg • ₹{item.base_price} • {item.city}
                        </p>
                      </div>

                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "0.5rem",
                        background: item.status === "OPEN" ? "#eff6ff" : item.status === "ACCEPTED" ? "#dcfce7" : "#f1f5f9",
                        color: item.status === "OPEN" ? "#1d4ed8" : item.status === "ACCEPTED" ? "#15803d" : "#64748b"
                      }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

export default SellerDashboard;
