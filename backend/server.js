// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Connect DB
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Waste Market Backend Running 🚀");
});

// Ping test route
app.get('/api/ping', (req, res) => {
  res.json({ message: "Backend is working 🚀" });
});

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Waste routes (must have authMiddleware inside)
const wasteRoutes = require('./routes/wasteRoutes');
app.use('/api/waste', wasteRoutes);

const requestRoutes = require("./routes/requestRoutes");
app.use("/api/requests", requestRoutes);

// Optional error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
