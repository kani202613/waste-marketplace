// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import { setAuthToken } from "./services/api";
import "./App.css";

// Smart root redirect based on authentication state
const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (token && role) {
    return <Navigate to={role === "seller" ? "/seller" : "/buyer"} replace />;
  }
  return <Navigate to="/login" replace />;
};

// Protected Route wrapper with smart role-based fallback
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the user's authorized dashboard to prevent login loops
    return <Navigate to={role === "seller" ? "/seller" : "/buyer"} replace />;
  }

  return children;
};

// Public Route wrapper that redirects already-authenticated users
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role) {
    return <Navigate to={role === "seller" ? "/seller" : "/buyer"} replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Seller only dashboard */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Buyer & Collector dashboard */}
        <Route
          path="/buyer"
          element={
            <ProtectedRoute allowedRoles={["buyer", "collector"]}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
