# ♻️ Waste Marketplace

A full-stack web application connecting waste sellers with buyers and recycling collectors to enable efficient waste management and circular economy trading.

Built using **React 19**, **Node.js / Express**, **MongoDB Atlas (Mongoose)**, and **JWT Authentication**.

---

## 🌟 Key Features

### 👤 User Roles & Authentication
* **Role-Based Access**: Multi-role support (`seller`, `collector`, `buyer`).
* **Secure Auth**: Password hashing via `bcryptjs` and JSON Web Token (`jsonwebtoken`) authentication with protected routes.
* **Persistent Sessions**: Automatic token interceptor for uninterrupted API authorization.

### 📦 Seller Dashboard
* **Post Listings**: List waste items with categories (Plastic, Paper, Metal, E-waste), weight (kg), price (₹), and location.
* **Manage Listings**: View live item status (`OPEN`, `ACCEPTED`, `CLOSED`).
* **Incoming Requests**: Real-time management of pick-up requests with **Accept**, **Reject**, or **Mark Picked Up / Completed** actions. Accepting a request automatically declines other pending requests for the same listing.

### 🛒 Buyer & Collector Dashboard
* **Explore Listings**: Search and filter waste listings by keyword, category, and city.
* **Send Pick-Up Requests**: Request items directly with a single click and prevent duplicate requests.
* **Track Request Statuses**: Real-time dashboard stats tracking Total Requests, Active Orders, and Completed Pick-ups.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, React Router v7, Axios, CSS Modules / App Styles
* **Backend**: Node.js, Express 5, CORS, Mongoose, dotenv
* **Database**: MongoDB Atlas (Cloud Database)
* **Dev Tools**: Concurrently, Nodemon

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kani202613/waste-marketplace.git
cd waste-marketplace
npm install
npm install --prefix frontend
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=waste-Market
JWT_SECRET=supersecretkey123
PORT=5000
```

### 3. Run Development Server
Run both the Express backend and React frontend concurrently with a single command:
```bash
npm run dev
```
* **Frontend**: http://localhost:3000
* **Backend API**: http://localhost:5000/api

---

## 🌐 Production Deployment Guide (Render)

### Option 1: Unified Web Service Deployment (Recommended ⭐)
Deploys both backend API and frontend static assets in **1 single Render Web Service**:

1. Log into [Render Dashboard](https://dashboard.render.com/) and click **New + -> Web Service**.
2. Connect your GitHub repository (`kani202613/waste-marketplace`).
3. Set configuration fields:
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   * `MONGO_URI`: `mongodb+srv://kani41910_db_user:Kani%402006@waste-market.pq8gedc.mongodb.net/?appName=waste-Market`
   * `JWT_SECRET`: `supersecretkey123`
   * `NODE_ENV`: `production`
5. Click **Create Web Service**. Express automatically compiles and serves the React frontend at your root deployment URL!

---

### Option 2: Split Deployment (Backend Web Service + Frontend Static Site)

#### Step A: Deploy Backend (Web Service)
1. Create a **Web Service** pointing to your repository.
2. Set:
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
3. Add Environment Variables: `MONGO_URI`, `JWT_SECRET`, `PORT=5000`.
4. Copy your backend URL (e.g. `https://waste-backend.onrender.com`).

#### Step B: Deploy Frontend (Static Site)
1. Click **New + -> Static Site** on Render.
2. Set configuration fields:
   * **Root Directory**: *(leave blank)*
   * **Build Command**: `npm install --prefix frontend && npm run build --prefix frontend`
   * **Publish Directory**: `frontend/build`
3. Add Environment Variable:
   * `REACT_APP_API_URL`: `https://waste-backend.onrender.com/api`
4. Click **Deploy Static Site**.

---

## 🔑 Environment Variable Reference

| Variable | Description | Location |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas Connection String | Backend `.env` / Render Env |
| `JWT_SECRET` | Secret key used for signing JWT auth tokens | Backend `.env` / Render Env |
| `PORT` | Backend server port (default: 5000) | Backend `.env` / Render Env |
| `REACT_APP_API_URL` | Optional API base URL override for frontend | Frontend build / Render Env |
| `CLIENT_URL` | Allowed origin domain(s) for CORS | Backend `.env` / Render Env |
