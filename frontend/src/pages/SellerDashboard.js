// src/pages/SellerDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "E-waste",
    approx_weight: "",
    base_price: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(userStr));
    } catch (e) {
      navigate("/login");
      return;
    }

    fetchMyItems();
    fetchIncomingRequests();
  }, [navigate]);

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "info" }), 4000);
  };

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

    if (!form.title.trim() || !form.address.trim() || !form.city.trim() || !form.pincode.trim()) {
      showToast("Please fill in all listing details.", "error");
      return;
    }

    if (Number(form.approx_weight) <= 0 || Number(form.base_price) < 0) {
      showToast("Weight must be greater than 0, and price cannot be negative.", "error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        weight: Number(form.approx_weight),
        basePrice: Number(form.base_price),
        address: form.address.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
      };

      const res = await api.post("/waste", payload);
      showToast(res.data.message || "Waste material posted successfully!", "success");

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
      showToast(err.response?.data?.message || "Error creating waste item.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      const res = await api.put(`/requests/${requestId}`, { status });
      showToast(res.data.message || `Request ${status.toLowerCase()} successfully!`, "success");
      fetchIncomingRequests();
      fetchMyItems();
    } catch (err) {
      console.error("Error updating request:", err);
      showToast(err.response?.data?.message || "Failed to update request status.", "error");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this listing from the marketplace?")) {
      return;
    }

    setDeletingId(itemId);
    try {
      const res = await api.delete(`/waste/${itemId}`);
      showToast(res.data.message || "Listing deleted successfully.", "info");
      fetchMyItems();
      fetchIncomingRequests();
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.response?.data?.message || "Failed to delete item.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setAuthToken(null);
    navigate("/login");
  };

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const acceptedRequests = requests.filter(r => r.status === "ACCEPTED");
  const completedRequests = requests.filter(r => r.status === "COMPLETED");

  return (
    <div className="dashboard-layout">
      {/* APP NAVBAR */}
      <header className="app-navbar">
        <div className="brand-container">
          <div className="brand-icon">♻️</div>
          <div>
            <h1 className="brand-title">WasteSmart <span>Seller</span></h1>
          </div>
        </div>

        <div className="nav-actions">
          {user && (
            <div className="user-chip">
              <span className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "S"}</span>
              <span className="user-name-text">{user.name}</span>
              <span className="role-badge seller">Seller</span>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="dashboard-main">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <p>Active Listings</p>
              <h2>{items.length}</h2>
            </div>
            <div className="stat-icon emerald">📦</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Pending Pick-Up Requests</p>
              <h2 className="text-amber">{pendingRequests.length}</h2>
            </div>
            <div className="stat-icon amber">📩</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Active Pick-Ups In Progress</p>
              <h2 className="text-blue">{acceptedRequests.length}</h2>
            </div>
            <div className="stat-icon blue">🚚</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Closed & Completed Deals</p>
              <h2 className="text-purple">{completedRequests.length}</h2>
            </div>
            <div className="stat-icon purple">🏁</div>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {message.text && (
          <div className={`toast-notification ${message.type}`}>
            <span>{message.type === "success" ? "✅" : message.type === "error" ? "⚠️" : "ℹ️"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* DASHBOARD SPLIT GRID */}
        <div className="seller-grid">
          
          {/* LEFT COLUMN: POST WASTE ITEM FORM */}
          <div className="panel-card">
            <div className="panel-header">
              <h2 className="panel-title">Post Waste Material</h2>
              <p className="panel-subtitle">Create a new scrap listing for verified recycling collectors</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-form-group">
                <label className="auth-label">Listing Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Clean Industrial HDPE Drums & Crates Scrap"
                  required
                  className="auth-input"
                />
              </div>

              {/* CATEGORY VISUAL PILLS */}
              <div className="auth-form-group">
                <label className="auth-label">Material Category *</label>
                <div className="category-pills-grid">
                  {[
                    { id: "E-waste", label: "⚡ E-waste" },
                    { id: "Metal", label: "🔩 Metal" },
                    { id: "Plastic", label: "♻️ Plastic" },
                    { id: "Paper", label: "📄 Paper" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`pill-btn ${form.category === cat.id ? "active" : ""}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row-2">
                <div className="auth-form-group">
                  <label className="auth-label">Approx Weight (kg) *</label>
                  <input
                    name="approx_weight"
                    type="number"
                    min="1"
                    value={form.approx_weight}
                    onChange={handleChange}
                    placeholder="150"
                    required
                    className="auth-input"
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">Base Price (₹) *</label>
                  <input
                    name="base_price"
                    type="number"
                    min="0"
                    value={form.base_price}
                    onChange={handleChange}
                    placeholder="2500"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Street / Industrial Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Guindy Industrial Estate, Phase 2"
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-row-2">
                <div className="auth-form-group">
                  <label className="auth-label">City *</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    required
                    className="auth-input"
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">Pincode *</label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="600032"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-btn submit-listing-btn"
              >
                {loading ? "Listing item..." : "➕ Post Listing to Market"}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: INCOMING REQUESTS & MY ITEMS */}
          <div className="seller-right-column">
            
            {/* INCOMING REQUESTS PANEL */}
            <div className="panel-card">
              <div className="panel-header space-between">
                <div>
                  <h3 className="panel-title">📩 Incoming Pick-Up Requests</h3>
                  <p className="panel-subtitle">Review, accept, or complete collection requests</p>
                </div>
                <span className="badge-counter amber">
                  {pendingRequests.length} Pending
                </span>
              </div>

              {requests.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">📭</span>
                  <p className="empty-title">No incoming requests yet</p>
                  <p className="empty-subtitle">When collectors request your materials, they will appear here in real-time.</p>
                </div>
              ) : (
                <div className="scrollable-list">
                  {requests.map((req) => (
                    <div key={req.id} className="request-card">
                      <div className="request-header">
                        <strong className="request-title">{req.title}</strong>
                        <span className={`status-badge ${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="request-meta">
                        <span>👤 Buyer: <strong>{req.buyerName}</strong></span>
                        <span>✉️ {req.buyerEmail}</span>
                        {req.buyerPhone && <span>📞 {req.buyerPhone}</span>}
                      </div>

                      <div className="request-price-row">
                        <span>Price: <strong>₹{Number(req.base_price).toLocaleString()}</strong></span>
                        <span>Weight: <strong>{req.approx_weight} kg</strong></span>
                        <span>City: <strong>{req.city}</strong></span>
                      </div>

                      {req.status === "PENDING" && (
                        <div className="action-buttons-group">
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, "ACCEPTED")}
                            className="btn-action accept"
                          >
                            ✓ Accept Pick-Up
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, "REJECTED")}
                            className="btn-action decline"
                          >
                            ✕ Decline
                          </button>
                        </div>
                      )}

                      {req.status === "ACCEPTED" && (
                        <div className="action-buttons-group">
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, "COMPLETED")}
                            className="btn-action complete"
                          >
                            🏁 Mark Picked Up & Completed
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MY LISTED ITEMS PANEL */}
            <div className="panel-card">
              <div className="panel-header space-between">
                <div>
                  <h3 className="panel-title">📋 My Listed Items</h3>
                  <p className="panel-subtitle">Manage all active scrap listings created by your account</p>
                </div>
                <span className="badge-counter emerald">
                  {items.length} Total
                </span>
              </div>

              {items.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">📦</span>
                  <p className="empty-title">You haven't listed any items yet</p>
                  <p className="empty-subtitle">Use the form on the left to post your first waste listing.</p>
                </div>
              ) : (
                <div className="scrollable-list">
                  {items.map((item) => (
                    <div key={item.id} className="item-row-card">
                      <div className="item-row-info">
                        <div className="item-row-header">
                          <strong className="item-row-title">{item.title}</strong>
                          <span className="category-chip">{item.category}</span>
                        </div>
                        <p className="item-row-meta">
                          {item.approx_weight} kg • ₹{Number(item.base_price).toLocaleString()} • {item.city} ({item.address})
                        </p>
                      </div>

                      <div className="item-row-actions">
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                        {item.status === "OPEN" && (
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingId === item.id}
                            className="btn-delete-item"
                            title="Delete this listing"
                          >
                            {deletingId === item.id ? "..." : "🗑️"}
                          </button>
                        )}
                      </div>
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
