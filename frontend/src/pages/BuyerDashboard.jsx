// src/pages/BuyerDashboard.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";

const BuyerDashboard = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [myRequests, setMyRequests] = useState([]);

  // Load items + my requests from backend
  useEffect(() => {
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
        // Make sure backend SELECT includes r.waste_item_id
        const mapped = res.data.map((r) => ({
          id: r.id, // request id
          waste_item_id: r.waste_item_id, // item id (for duplicate check)
          title: r.title,
          city: r.city,
          approx_weight: r.approx_weight,
          base_price: r.base_price,
          status: r.status, // e.g. 'PENDING', 'ACCEPTED', 'COMPLETED'
          requestedAt: r.created_at,
        }));
        setMyRequests(mapped);
      } catch (err) {
        console.error("Error fetching my requests", err);
      }
    };

    fetchItems();
    fetchMyRequests();
  }, []);

  const handleSendRequest = async (item) => {
    // prevent duplicate requests for same item (by item id)
    if (myRequests.some((req) => req.waste_item_id === item.id)) return;

    try {
      await api.post("/requests", {
        waste_item_id: item.id,
      });

      const newRequest = {
        id: Date.now(), // temp local id
        waste_item_id: item.id,
        title: item.title,
        city: item.city,
        approx_weight: item.approx_weight,
        base_price: item.base_price,
        status: "PENDING",
        requestedAt: new Date().toLocaleString(),
      };

      setMyRequests((prev) => [...prev, newRequest]);
    } catch (err) {
      console.error("Error creating request", err);
    }
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
          WasteSmart<span> Buyer</span>
        </div>

        <div className="bd-search">
          <input
            type="text"
            placeholder="Search plastic, paper, metal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bd-filters">
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
        </div>
      </header>

      {/* Main */}
      <main className="bd-main">
        <section className="bd-left">
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
            {filteredItems.map((item) => (
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
                    Seller: {item.sellerName} ({item.sellerEmail})
                  </p>
                </div>

                <div className="bd-item-actions">
                  <button className="btn-outline">View Details</button>
                  <button
                    className="btn-primary"
                    onClick={() => handleSendRequest(item)}
                  >
                    Send Request
                  </button>
                </div>
              </div>
            ))}

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
