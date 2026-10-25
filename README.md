# ♻️ Waste Marketplace

A full-stack circular economy platform connecting waste sellers with certified recycling collectors and buyers. The platform features an enterprise tech-company UI design system, real-time listing management, conflict-free pickup request coordination, automated multi-buyer request resolution, and high-performance persistent storage.

Built with **React 19**, **Node.js / Express 5**, **SQLite 3 (Relational with Foreign Keys)**, and **JWT Authentication**.

---

## 🌟 Key Features

### 👤 Role-Based Authentication & Profiles
- **Multi-Role Support**: Distinguishes between `seller` (generators of recyclable/e-waste) and `collector` / `buyer` (recycling facilities, scrap yards, collectors).
- **Security**: Password hashing with `bcryptjs` and signed JSON Web Tokens (`jsonwebtoken`).
- **One-Click Demo Accounts**: Instant quick-fill buttons on the login page for rapid evaluation:
  - **Seller Account**: `john@seller.com` / `password123`
  - **Collector Account**: `alex@collector.com` / `password123`
- **Smart Routing**: Auto-redirects logged-in users directly to their designated dashboard (`/seller` or `/buyer`), blocking unauthorized routes.

### 📦 Seller Dashboard
- **Create Listings**: Post waste with detailed specifications: title, category (E-Waste, Metal, Plastic, Paper), approximate weight (kg), base price (₹), full address, city, and pincode.
- **Listing Metrics**: Real-time counter cards tracking Active Listings, Pending Requests, Accepted Pickups, and Completed Orders.
- **Request Management**: Inspect buyer details (name, email, phone) with actions to **Accept**, **Decline**, or **Mark Picked Up / Completed**.
- **Conflict Auto-Resolution**: Accepting one buyer's request automatically declines all other competing requests for that listing and updates item status to `ACCEPTED`.
- **Listing Management**: Unsold items can be deleted with confirmation modals.

### 🛒 Collector & Buyer Dashboard
- **Marketplace Grid**: 1,000+ realistic e-waste and industrial recycling listings loaded from persistent storage.
- **Search & Filtering**: Live search by keywords, filter by category (`E-Waste`, `Metal`, `Plastic`, `Paper`), filter by city (10 major hubs), and sorting (`Price: Low to High`, `Price: High to Low`, `Weight: Heaviest First`, `Newest`).
- **Item Details Modal**: Comprehensive modal showing full item specs, location, and seller contact info.
- **Request Pickup**: Submit pickup requests with prevention of self-requests or duplicate requests.
- **Request Tracking & Cancellation**: Live tracker showing sent request states (`PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`), with ability to cancel pending requests.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, React Router v7, Axios, Plus Jakarta Sans typography, Emerald design tokens (`#059669`).
- **Backend**: Node.js, Express 5, CORS, SQLite 3 (`sqlite3` & `sqlite`), JWT, Bcrypt.
- **Database**: SQLite (`backend/database.sqlite`) with relational tables, foreign key constraints (`ON DELETE CASCADE`), and automatic schema migration.
- **Testing**: Built-in Node.js native test runner (`node:test`, `node:assert`) with 36 end-to-end integration tests.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/kani202613/waste-marketplace.git
cd waste-marketplace
npm install
npm install --prefix frontend
```

### 2. Seed Database (1,000 Realistic Items)
```bash
npm run seed
```
Initializes `backend/database.sqlite` with 5 demo accounts and 1,000 realistic e-waste, metal, plastic, and paper listings across 10 cities.

### 3. Run Development Server
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`

---

## 🧪 Automated Testing

Run the complete 36-test automated integration suite:
```bash
npm test
```
Verifies health checks, user registration, email/password validation, JWT protection, waste items CRUD, multi-criteria filtering, collection request auto-resolution, request cancellation, and database persistence.

---

## 🌐 Production Deployment (Render)

This repository is configured for **Single-Service Full-Stack Deployment** on [Render](https://render.com):

1. Create a **Web Service** on Render connected to `kani202613/waste-marketplace`.
2. Settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run seed`
   - **Start Command**: `npm start`
3. Environment Variables:
   - `JWT_SECRET`: `your_super_secret_key_here`
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (set automatically by Render)
4. Express serves the pre-compiled React frontend at root `/` and API routes at `/api/*`.

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`name`, `email`, `password`, `role`, `phone`, `city`, `address`, `pincode`).
- `POST /api/auth/login` - Authenticate user, returns JWT token and profile.

### Waste Listings (`/api/waste`)
- `GET /api/waste` - Query open marketplace listings (Supports `?category=`, `?city=`, `?search=`, `?sort=`, `?limit=`).
- `POST /api/waste` - Create a new listing (Seller authenticated).
- `GET /api/waste/my` - Fetch current seller's listings (Seller authenticated).
- `DELETE /api/waste/:id` - Delete an unsold listing (Owner authenticated).

### Requests Workflow (`/api/requests`)
- `POST /api/requests` - Send pickup request for an item (Buyer authenticated).
- `GET /api/requests/my` - View sent pickup requests (Buyer authenticated).
- `GET /api/requests/seller` - View incoming pickup requests for seller's items (Seller authenticated).
- `PUT /api/requests/:id` - Update status (`ACCEPTED`, `REJECTED`, `COMPLETED`) (Seller authenticated).
- `DELETE /api/requests/:id` - Cancel pending pickup request (Buyer authenticated).
