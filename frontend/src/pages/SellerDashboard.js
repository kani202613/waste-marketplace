// src/pages/SellerDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Plastic",
    approx_weight: "",
    base_price: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Load user + items
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(userStr));
    fetchMyItems();
  }, []);

  // Fetch this seller's items
  const fetchMyItems = async () => {
    try {
      const res = await api.get("/waste/my");
      setItems(res.data || []); // backend returns array
    } catch (err) {
      console.error(err);
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Creating item...");

    try {
      const payload = {
        title: form.title,
        category: form.category,
        approx_weight: Number(form.approx_weight),
        base_price: Number(form.base_price),
        address: form.address,
        city: form.city,
        pincode: form.pincode,
      };

      const res = await api.post("/waste", payload);

      setMessage(res.data.message || "Created!");

      // Reset form
      setForm({
        title: "",
        category: "Plastic",
        approx_weight: "",
        base_price: "",
        address: "",
        city: "",
        pincode: "",
      });

      fetchMyItems(); // refresh list
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage("Error creating item.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      {/* HEADER */}
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Seller Dashboard</h2>
        <div>
          {user && <span style={{ marginRight: "12px" }}>Hi, {user.name}</span>}
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ display: "flex", gap: "24px", padding: "24px" }}>
        {/* LEFT - FORM */}
        <div
          style={{
            flex: 1,
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Add Waste Item</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "8px" }}>
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              />
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              >
                <option value="Plastic">Plastic</option>
                <option value="Metal">Metal</option>
                <option value="Paper">Paper</option>
                <option value="E-waste">E-waste</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, marginBottom: "8px" }}>
                <label>Approx Weight (kg)</label>
                <input
                  name="approx_weight"
                  value={form.approx_weight}
                  onChange={handleChange}
                  required
                  type="number"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </div>

              <div style={{ flex: 1, marginBottom: "8px" }}>
                <label>Base Price (₹)</label>
                <input
                  name="base_price"
                  value={form.base_price}
                  onChange={handleChange}
                  required
                  type="number"
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </div>
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

            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, marginBottom: "8px" }}>
                <label>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </div>

              <div style={{ flex: 1, marginBottom: "8px" }}>
                <label>Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px", marginTop: "4px" }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                marginTop: "8px",
                padding: "10px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add Item
            </button>

            {message && (
              <p style={{ marginTop: "8px", color: "#444" }}>{message}</p>
            )}
          </form>
        </div>

        {/* RIGHT - LIST */}
        <div
          style={{
            flex: 1,
            background: "white",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h3>My Waste Items</h3>

          {items.length === 0 ? (
            <p style={{ marginTop: "8px" }}>No items yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "8px" }}>
              {items.map((item) => (
                <li
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                    padding: "8px 0",
                  }}
                >
                  <strong>{item.title}</strong> ({item.category})<br />
                  {item.approx_weight} kg • ₹{item.base_price} • {item.city}
                  <br />
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background:
                        item.status === "OPEN"
                          ? "#e0f2fe"
                          : "#fef9c3",
                    }}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;
