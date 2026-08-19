const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

// Connect DB
const db = require('./config/db');

const app = express();

// Configure CORS
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

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

// Request routes
const requestRoutes = require("./routes/requestRoutes");
app.use("/api/requests", requestRoutes);

// Serve frontend build static files if present (Single-service production deployment)
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // Home route fallback when build directory is not generated yet
  app.get('/', (req, res) => {
    res.send("Waste Market Backend Running 🚀");
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
