// backend/controllers/wasteController.js
const db = require("../config/db");

// 1️⃣ SELLER: Add a new waste item
exports.createWasteItem = (req, res) => {
  // If you are using authMiddleware, req.user.id will be set
  // For safety, fallback to 4 (test seller) if not present
  const sellerId = req.user?.id || 4;

  const {
    title,
    category,
    weight,      // from frontend form
    basePrice,
    address,
    city,
    pincode,
  } = req.body;

  if (!title || !category || !address || !city || !pincode) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO waste_items 
      (title, category, approx_weight, base_price, address, city, pincode, seller_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, category, weight, basePrice, address, city, pincode, sellerId],
    (err, result) => {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ message: "Failed to create item" });
      }

      return res.status(201).json({
        message: "Waste item created",
        itemId: result.insertId,
      });
    }
  );
};

// 2️⃣ BUYER: Get ALL items with seller info
exports.getAllWasteItems = (req, res) => {
  const sql = `
    SELECT 
      w.id,
      w.title,
      w.category,
      w.approx_weight,
      w.base_price,
      w.address,
      w.city,
      w.pincode,
      w.seller_id,
      u.name AS sellerName,
      u.email AS sellerEmail
    FROM waste_items w
    JOIN users u ON w.seller_id = u.id
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("DB fetch error (all items):", err);
      return res.status(500).json({ message: "Failed to load items" });
    }

    return res.json(rows);
  });
};

// 3️⃣ SELLER: Get ONLY my items
exports.getMyWasteItems = (req, res) => {
  const sellerId = req.user?.id || 4; // fallback for testing

  const sql = `
    SELECT 
      id,
      title,
      category,
      approx_weight,
      base_price,
      address,
      city,
      pincode,
      seller_id
    FROM waste_items
    WHERE seller_id = ?
  `;

  db.query(sql, [sellerId], (err, rows) => {
    if (err) {
      console.error("DB fetch error (my items):", err);
      return res.status(500).json({ message: "Failed to load your items" });
    }

    return res.json(rows);
  });
};
