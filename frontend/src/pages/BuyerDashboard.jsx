// src/pages/BuyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

function BuyerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null); // Modal details
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userStr));
    fetchItems();
    fetchMyRequests();
  }, [navigate]);

  const fetchItems = async () => {
    try {
      const res = await api.get("/waste");
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get("/requests/buyer");
      setMyRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching buyer requests:", err);
    }
  };

  const handleSendRequest = async (itemId) => {
    setMessage("Sending request...");
    try {
      const res = await api.post("/requests", { waste_item_id: itemId });
      setMessage(res.data.message || "Request sent successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchMyRequests();
      setSelectedItem(null);
    } catch (err) {
      console.error("Error sending request:", err);
      setMessage(err.response?.data?.message || "Failed to send request.");
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

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.city.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchesCity =
      cityFilter === "All" || item.city === cityFilter;

    return matchesSearch && matchesCategory && matchesCity;
  });

  const getRequestForWasteItem = (itemId) => {
    return myRequests.find((r) => r.waste_item_id === itemId);
  };

  const activeOrdersCount = myRequests.filter(r => r.status === "PENDING" || r.status === "ACCEPTED").length;
  const completedOrdersCount = myRequests.filter(r => r.status === "COMPLETED").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-gradient)" }}>
      {/* NAVBAR */}
      <header className="app-navbar">
        <div className="brand-container">
          <div className="brand-icon">🛒</div>
          <div>
            <h1 className="brand-title">WasteSmart <span>Collector</span></h1>
          </div>
        </div>

        {/* SEARCH & FILTERS IN NAVBAR */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "0.75rem", top: "0.55rem", fontSize: "0.8125rem", color: "#64748b" }}>🔍</span>
            <input
              type="text"
              placeholder="Search PCB, Copper, Batteries, City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="auth-input"
              style={{ paddingLeft: "2.25rem", width: "240px", borderRadius: "9999px" }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="auth-input"
            style={{ width: "auto", borderRadius: "9999px" }}
          >
            <option value="All">All Categories</option>
            <option value="E-waste">⚡ E-waste</option>
            <option value="Plastic">♻️ Plastic</option>
            <option value="Metal">🔩 Metal</option>
            <option value="Paper">📄 Paper</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="auth-input"
            style={{ width: "auto", borderRadius: "9999px" }}
          >
            <option value="All">All Cities</option>
            <option value="Chennai">Chennai</option>
            <option value="Coimbatore">Coimbatore</option>
            <option value="Salem">Salem</option>
            <option value="Trichy">Trichy</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
          </select>
        </div>

        <div className="nav-actions">
          {user && (
            <div className="user-chip">
              <span className="user-avatar" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                {user.name ? user.name.charAt(0).toUpperCase() : "C"}
              </span>
              <span>{user.name}</span>
              <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "#dbeafe", color: "#1e40af", fontWeight: "700" }}>Collector</span>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        
        {/* STATS OVERVIEW BAR */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <p>Available Listings</p>
              <h2>{items.length.toLocaleString()}</h2>
            </div>
            <div className="stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>⚡</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>My Requests Sent</p>
              <h2 style={{ color: "#2563eb" }}>{myRequests.length}</h2>
            </div>
            <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>📄</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Active Orders (Pending/Accepted)</p>
              <h2 style={{ color: "#d97706" }}>{activeOrdersCount}</h2>
            </div>
            <div className="stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>🚚</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Completed Pick-ups</p>
              <h2 style={{ color: "#7c3aed" }}>{completedOrdersCount}</h2>
            </div>
            <div className="stat-icon" style={{ background: "#f3e8ff", color: "#7c3aed" }}>✅</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.75rem" }}>
          
          {/* LEFT: WASTE MARKETPLACE ITEMS GRID */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "800", color: "#0f172a" }}>
                Waste & Scrap Material Marketplace
              </h2>
              <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                Showing <strong>{Math.min(50, filteredItems.length)}</strong> of {filteredItems.length.toLocaleString()} matches
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div style={{ background: "#ffffff", padding: "3rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", textAlign: "center", color: "#64748b" }}>
                No scrap items match your current search and filter criteria.
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.slice(0, 50).map((item) => {
                  const req = getRequestForWasteItem(item.id);
                  return (
                    <div key={item.id} className="waste-card">
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                          <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: "800", color: "#0f172a", lineHeight: "1.3" }}>
                            {item.title}
                          </h4>
                          <span className="category-chip">{item.category}</span>
                        </div>

                        <p style={{ margin: "0.3rem 0", fontSize: "0.8125rem", color: "#64748b" }}>
                          ⚡ <strong>{item.approx_weight} kg</strong> • Base Price: <strong className="price-tag">₹{item.base_price.toLocaleString()}</strong>
                        </p>

                        <p style={{ margin: "0.3rem 0", fontSize: "0.75rem", color: "#64748b" }}>
                          📍 {item.city} ({item.address})
                        </p>

                        <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.7rem", color: "#94a3b8" }}>
                          Seller: {item.sellerName}
                        </p>
                      </div>

                      <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="btn-card-action btn-card-outline"
                          style={{ flex: 1 }}
                        >
                          👁️ Details
                        </button>

                        {req ? (
                          <span style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.75rem",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            background: req.status === "PENDING" ? "#fef3c7" : req.status === "ACCEPTED" ? "#dcfce7" : "#e0f2fe",
                            color: req.status === "PENDING" ? "#92400e" : req.status === "ACCEPTED" ? "#166534" : "#075985",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1
                          }}>
                            {req.status}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(item.id)}
                            className="btn-card-action btn-card-primary"
                            style={{ flex: 1 }}
                          >
                            🚀 Request Pick-Up
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: MY SENT REQUESTS TRACKER PANEL */}
          <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "1.25rem", border: "1px solid var(--border-color)", boxShadow: "var(--card-shadow)", height: "fit-content" }}>
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>📌 My Sent Requests</h3>
              <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>Track status of your collection orders</p>
            </div>

            {myRequests.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "#94a3b8", textAlign: "center", padding: "1.5rem 0" }}>No requests sent yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "550px", overflowY: "auto", paddingRight: "0.3rem" }}>
                {myRequests.map((req) => (
                  <div key={req.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                      <strong style={{ fontSize: "0.8125rem", color: "#0f172a" }}>{req.title}</strong>
                      <span style={{
                        fontSize: "0.6875rem",
                        fontWeight: "700",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        background: req.status === "PENDING" ? "#fef3c7" : req.status === "ACCEPTED" ? "#dcfce7" : req.status === "COMPLETED" ? "#e0f2fe" : "#fee2e2",
                        color: req.status === "PENDING" ? "#92400e" : req.status === "ACCEPTED" ? "#166534" : req.status === "COMPLETED" ? "#075985" : "#991b1b",
                      }}>
                        {req.status}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                      📍 {req.city} • {req.approx_weight} kg • ₹{req.base_price}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* ITEM DETAILS MODAL */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span className="category-chip" style={{ marginBottom: "0.4rem" }}>{selectedItem.category}</span>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1rem", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Approx Weight:</span>
                <strong style={{ color: "#0f172a" }}>{selectedItem.approx_weight} kg</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Base Price:</span>
                <strong style={{ color: "#059669" }}>₹{selectedItem.base_price.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Location / Address:</span>
                <strong style={{ color: "#0f172a", textAlign: "right" }}>{selectedItem.address}, {selectedItem.city} ({selectedItem.pincode})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                <span style={{ color: "#64748b" }}>Listed By Seller:</span>
                <strong style={{ color: "#0f172a" }}>{selectedItem.sellerName} ({selectedItem.sellerEmail})</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-card-action btn-card-outline"
              >
                Close
              </button>

              {!getRequestForWasteItem(selectedItem.id) ? (
                <button
                  onClick={() => handleSendRequest(selectedItem.id)}
                  className="btn-card-action btn-card-primary"
                >
                  🚀 Confirm Pick-Up Request
                </button>
              ) : (
                <button disabled className="btn-card-action btn-card-outline">
                  Already Requested ({getRequestForWasteItem(selectedItem.id).status})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
