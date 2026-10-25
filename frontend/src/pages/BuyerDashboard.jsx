// src/pages/BuyerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
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
  const [sortOption, setSortOption] = useState("newest");
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "info" }), 4000);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/waste?sort=${sortOption}`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      showToast("Unable to fetch waste marketplace items.", "error");
    } finally {
      setLoading(false);
    }
  }, [sortOption]);

  const fetchMyRequests = useCallback(async () => {
    try {
      const res = await api.get("/requests/my");
      setMyRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching buyer requests:", err);
    }
  }, []);

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

    fetchItems();
    fetchMyRequests();
  }, [navigate, fetchItems, fetchMyRequests]);

  const handleSendRequest = async (itemId) => {
    try {
      const res = await api.post("/requests", { waste_item_id: itemId });
      showToast(res.data.message || "Pick-up request sent to seller!", "success");
      fetchMyRequests();
      setSelectedItem(null);
    } catch (err) {
      console.error("Error sending request:", err);
      showToast(err.response?.data?.message || "Failed to send request.", "error");
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this pick-up request?")) {
      return;
    }

    setCancellingId(requestId);
    try {
      const res = await api.delete(`/requests/${requestId}`);
      showToast(res.data.message || "Request cancelled.", "info");
      fetchMyRequests();
    } catch (err) {
      console.error("Error cancelling request:", err);
      showToast(err.response?.data?.message || "Failed to cancel request.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setAuthToken(null);
    navigate("/login");
  };

  // Filtered and sorted items
  const filteredItems = items.filter((item) => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      item.title.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.city.toLowerCase().includes(term) ||
      (item.sellerName && item.sellerName.toLowerCase().includes(term));

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchesCity =
      cityFilter === "All" || item.city === cityFilter;

    return matchesSearch && matchesCategory && matchesCity;
  });

  const getRequestForWasteItem = (itemId) => {
    return myRequests.find((r) => r.waste_item_id === itemId);
  };

  const pendingRequestsCount = myRequests.filter(r => r.status === "PENDING").length;
  const activeOrdersCount = myRequests.filter(r => r.status === "ACCEPTED").length;
  const completedOrdersCount = myRequests.filter(r => r.status === "COMPLETED").length;

  return (
    <div className="dashboard-layout">
      {/* NAVBAR */}
      <header className="app-navbar">
        <div className="brand-container">
          <div className="brand-icon">🛒</div>
          <div>
            <h1 className="brand-title">WasteSmart <span>Collector</span></h1>
          </div>
        </div>

        <div className="nav-actions">
          {user && (
            <div className="user-chip">
              <span className="user-avatar blue">
                {user.name ? user.name.charAt(0).toUpperCase() : "C"}
              </span>
              <span className="user-name-text">{user.name}</span>
              <span className="role-badge collector">Collector</span>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        
        {/* STATS OVERVIEW BAR */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <p>Available Listings</p>
              <h2>{items.length.toLocaleString()}</h2>
            </div>
            <div className="stat-icon emerald">⚡</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Requests Sent</p>
              <h2 className="text-blue">{myRequests.length}</h2>
            </div>
            <div className="stat-icon blue">📄</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Pending Review</p>
              <h2 className="text-amber">{pendingRequestsCount}</h2>
            </div>
            <div className="stat-icon amber">⏳</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Pick-Ups Accepted / In Progress</p>
              <h2 className="text-emerald">{activeOrdersCount}</h2>
            </div>
            <div className="stat-icon emerald">🚚</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <p>Completed Collections</p>
              <h2 className="text-purple">{completedOrdersCount}</h2>
            </div>
            <div className="stat-icon purple">✅</div>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {message.text && (
          <div className={`toast-notification ${message.type}`}>
            <span>{message.type === "success" ? "✅" : message.type === "error" ? "⚠️" : "ℹ️"}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="filter-toolbar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search E-waste, Metals, Plastics, City, Seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button 
                type="button" 
                onClick={() => setSearch("")} 
                className="search-clear-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filters-group">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="E-waste">⚡ E-waste</option>
              <option value="Metal">🔩 Metal</option>
              <option value="Plastic">♻️ Plastic</option>
              <option value="Paper">📄 Paper</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Cities</option>
              <option value="Chennai">Chennai</option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Salem">Salem</option>
              <option value="Trichy">Trichy</option>
              <option value="Erode">Erode</option>
              <option value="Madurai">Madurai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="filter-select sort"
            >
              <option value="newest">🕒 Sort: Newest First</option>
              <option value="price_asc">💵 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
              <option value="weight_desc">⚖️ Weight: Heaviest First</option>
            </select>
          </div>
        </div>

        {/* DASHBOARD SPLIT GRID */}
        <div className="buyer-grid">
          
          {/* LEFT: WASTE MARKETPLACE ITEMS GRID */}
          <div className="buyer-items-section">
            <div className="section-header-row">
              <h2 className="section-title">
                Waste & Scrap Marketplace Listings
              </h2>
              <span className="results-counter">
                Showing <strong>{Math.min(60, filteredItems.length)}</strong> of {filteredItems.length.toLocaleString()} items
              </span>
            </div>

            {loading ? (
              <div className="empty-state-box loading">
                <span className="loading-spinner"></span>
                <p>Loading scrap materials...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">🔍</span>
                <p className="empty-title">No scrap items match your search</p>
                <p className="empty-subtitle">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="items-grid">
                {filteredItems.slice(0, 60).map((item) => {
                  const req = getRequestForWasteItem(item.id);
                  return (
                    <div key={item.id} className="waste-card">
                      <div className="waste-card-top">
                        <div className="waste-card-header">
                          <h4 className="waste-card-title">{item.title}</h4>
                          <span className={`category-chip ${item.category.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                            {item.category}
                          </span>
                        </div>

                        <div className="waste-card-specs">
                          <div className="spec-item">
                            <span className="spec-label">Weight</span>
                            <strong className="spec-val">{item.approx_weight} kg</strong>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Base Price</span>
                            <strong className="spec-val price">₹{Number(item.base_price).toLocaleString()}</strong>
                          </div>
                        </div>

                        <p className="waste-card-location">
                          📍 {item.city} ({item.address})
                        </p>

                        <p className="waste-card-seller">
                          Seller: <strong>{item.sellerName}</strong>
                        </p>
                      </div>

                      <div className="waste-card-actions">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="btn-card-action btn-card-outline"
                        >
                          👁️ Details
                        </button>

                        {req ? (
                          <span className={`status-pill ${req.status.toLowerCase()}`}>
                            {req.status === "PENDING" ? "⏳ Requested" : req.status === "ACCEPTED" ? "🚚 Accepted" : "🏁 Completed"}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(item.id)}
                            className="btn-card-action btn-card-primary"
                          >
                            🚀 Request
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
          <div className="buyer-sidebar">
            <div className="panel-card sidebar-card">
              <div className="panel-header space-between">
                <div>
                  <h3 className="panel-title">📌 My Sent Requests</h3>
                  <p className="panel-subtitle">Real-time status of your pick-up requests</p>
                </div>
                <span className="badge-counter blue">
                  {myRequests.length} Total
                </span>
              </div>

              {myRequests.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">📭</span>
                  <p className="empty-title">No pick-up requests sent</p>
                  <p className="empty-subtitle">Click "Request" on any listing to initiate a pick-up request.</p>
                </div>
              ) : (
                <div className="scrollable-list requests-tracker">
                  {myRequests.map((req) => (
                    <div key={req.id} className="request-tracker-card">
                      <div className="request-tracker-top">
                        <strong className="request-tracker-title">{req.title}</strong>
                        <span className={`status-badge ${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="request-tracker-meta">
                        📍 {req.city} • {req.approx_weight} kg • ₹{Number(req.base_price).toLocaleString()}
                      </p>

                      {req.status === "PENDING" && (
                        <div className="request-tracker-actions">
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            disabled={cancellingId === req.id}
                            className="btn-cancel-request"
                          >
                            {cancellingId === req.id ? "Cancelling..." : "✕ Cancel Request"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* ITEM DETAILS MODAL */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="category-chip" style={{ marginBottom: "0.5rem" }}>
                  {selectedItem.category}
                </span>
                <h3 className="modal-title">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="modal-close-btn"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-details-grid">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Approx Weight:</span>
                <strong className="modal-detail-value">{selectedItem.approx_weight} kg</strong>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Base Price:</span>
                <strong className="modal-detail-value text-emerald">₹{Number(selectedItem.base_price).toLocaleString()}</strong>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Location / Address:</span>
                <strong className="modal-detail-value">{selectedItem.address}, {selectedItem.city} ({selectedItem.pincode})</strong>
              </div>
              <div className="modal-detail-row divider">
                <span className="modal-detail-label">Seller Contact:</span>
                <strong className="modal-detail-value">{selectedItem.sellerName} ({selectedItem.sellerEmail})</strong>
              </div>
            </div>

            <div className="modal-actions-row">
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
                <button disabled className="btn-card-action btn-card-outline disabled">
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
