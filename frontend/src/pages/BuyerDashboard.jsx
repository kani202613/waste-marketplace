// src/pages/BuyerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [myRequests, setMyRequests] = useState([]);
  const [message, setMessage] = useState("");

  // Load user details
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [navigate]);

  // Fetch items + requests from backend
  const fetchItems = async () => {
    try {
      const res = await api.get("/waste"); // GET /api/waste
      setItems(res.data || []);
    } catch (err) {
      console.error("Error fetching items", err);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get("/requests/my");
      const mapped = res.data.map((r) => ({
        id: r.id,
        waste_item_id: r.waste_item_id,
        title: r.title,
        city: r.city,
        approx_weight: r.approx_weight,
        base_price: r.base_price,
        status: r.status,
        requestedAt: new Date(r.created_at || Date.now()).toLocaleString(),
      }));
      setMyRequests(mapped);
    } catch (err) {
      console.error("Error fetching my requests", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchMyRequests();
  }, []);

  const handleSendRequest = async (item) => {
    // prevent duplicate requests for same item
    if (myRequests.some((req) => String(req.waste_item_id) === String(item.id))) return;

    try {
      setMessage("Sending request...");
      await api.post("/requests", {
        waste_item_id: item.id,
      });

      setMessage("Request sent successfully!");
      setTimeout(() => setMessage(""), 3000);
      await fetchMyRequests();
    } catch (err) {
      console.error("Error creating request", err);
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

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchCity = cityFilter === "All" || item.city === cityFilter;

    return matchSearch && matchCategory && matchCity;
  });

  const totalRequests = myRequests.length;
  const activeOrders = myRequests.filter(
    (req) => req.status === "PENDING" || req.status === "ACCEPTED"
  ).length;
  const completedOrders = myRequests.filter(
    (req) => req.status === "COMPLETED"
  ).length;

  return (
    <div className="buyer-dashboard">
      {/* Header */}
      <header className="bd-header">
        <div className="bd-logo">
          WasteSmart<span> Marketplace</span>
        </div>

        <div className="bd-search">
          <input
            type="text"
            placeholder="Search plastic, paper, metal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bd-filters" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Plastic">Plastic</option>
            <option value="Paper">Paper</option>
            <option value="Metal">Metal</option>
            <option value="E-waste">E-waste</option>
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="All">All Cities</option>
            <option value="Salem">Salem</option>
            <option value="Chennai">Chennai</option>
            <option value="Coimbatore">Coimbatore</option>
            <option value="Trichy">Trichy</option>
            <option value="Erode">Erode</option>
          </select>

          {user && (
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
              Hi, {user.name}
            </span>
          )}

          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="bd-main">
        <section className="bd-left">
          {/* Status Message Toast */}
          {message && (
            <div style={{
              padding: "10px 16px",
              marginBottom: "12px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px"
            }}>
              {message}
            </div>
          )}

          {/* Stats */}
          <div className="bd-stats">
            <div className="bd-stat-card">
              <p>Total Requests</p>
              <h2>{totalRequests}</h2>
            </div>
            <div className="bd-stat-card">
              <p>Active Orders</p>
              <h2>{activeOrders}</h2>
            </div>
            <div className="bd-stat-card">
              <p>Completed</p>
              <h2>{completedOrders}</h2>
            </div>
          </div>

          {/* Items */}
          <div className="bd-section-header">
            <h3>Available Waste Items</h3>
            <span>{filteredItems.length} items</span>
          </div>

          <div className="bd-items-grid">
            {filteredItems.map((item) => {
              const existingReq = myRequests.find(
                (req) => String(req.waste_item_id) === String(item.id)
              );
              return (
                <div key={item.id} className="bd-item-card">
                  <div className="bd-item-header">
                    <h4>{item.title}</h4>
                    <span className="bd-category-chip">{item.category}</span>
                  </div>

                  <div className="bd-item-body">
                    <p>
                      <strong>Weight:</strong> {item.approx_weight} kg
                    </p>
                    <p>
                      <strong>Base Price:</strong> ₹{item.base_price}
                    </p>
                    <p>
                      <strong>Location:</strong> {item.city} – {item.pincode}
                    </p>

                    <p className="bd-address">
                      Seller: {item.sellerName || "Seller"} ({item.sellerEmail || "N/A"})
                    </p>
                  </div>

                  <div className="bd-item-actions">
                    {existingReq ? (
                      <span className={`bd-status bd-status-${existingReq.status.toLowerCase()}`}>
                        {existingReq.status}
                      </span>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => handleSendRequest(item)}
                      >
                        Send Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <p className="bd-empty">No items match your filters.</p>
            )}
          </div>
        </section>

        {/* Right: My Requests */}
        <aside className="bd-right">
          <h3>My Requests</h3>
          {myRequests.length === 0 ? (
            <p className="bd-empty">
              You haven&apos;t requested any items yet. Explore items and click
              &quot;Send Request&quot;.
            </p>
          ) : (
            <ul className="bd-requests-list">
              {myRequests.map((req) => (
                <li key={req.id} className="bd-request-item">
                  <div>
                    <h4>{req.title}</h4>
                    <p className="bd-request-meta">
                      {req.city} • {req.approx_weight} kg • ₹{req.base_price}
                    </p>
                    <p className="bd-request-time">
                      Requested at: {req.requestedAt}
                    </p>
                  </div>
                  <span
                    className={`bd-status bd-status-${req.status.toLowerCase()}`}
                  >
                    {req.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
};

export default BuyerDashboard;
