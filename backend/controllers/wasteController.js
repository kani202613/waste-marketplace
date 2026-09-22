// backend/controllers/wasteController.js
const WasteItem = require("../models/WasteItem");

// 1️⃣ SELLER: Add a new waste item
exports.createWasteItem = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const sellerId = req.user.id;

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

    const created = await WasteItem.create({
      seller_id: sellerId,
      title,
      category,
      approx_weight: Number(weight) || 0,
      base_price: Number(basePrice) || 0,
      address,
      city,
      pincode
    });

    return res.status(201).json({
      message: "Waste item created",
      itemId: created.id,
    });
  } catch (error) {
    console.error("Create waste item error:", error);
    return res.status(500).json({ message: "Failed to create item", error: error.message });
  }
};

// 2️⃣ BUYER: Get ALL open items with seller info (Supports filtering & limit for 1000+ items)
exports.getAllWasteItems = async (req, res) => {
  try {
    const { category, city, search, limit } = req.query;
    const queryLimit = parseInt(limit) || 1000;

    const items = await WasteItem.findAllOpen({
      category,
      city,
      search,
      limit: queryLimit
    });

    const formatted = items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      approx_weight: item.approx_weight,
      base_price: item.base_price,
      address: item.address,
      city: item.city,
      pincode: item.pincode,
      seller_id: item.seller_id,
      sellerName: item.sellerName || "Unknown Seller",
      sellerEmail: item.sellerEmail || ""
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Get all items error:", error);
    return res.status(500).json({ message: "Failed to load items", error: error.message });
  }
};

// 3️⃣ SELLER: Get ONLY my items
exports.getMyWasteItems = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const sellerId = req.user.id;

    const items = await WasteItem.findBySeller(sellerId);

    const formatted = items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      approx_weight: item.approx_weight,
      base_price: item.base_price,
      address: item.address,
      city: item.city,
      pincode: item.pincode,
      status: item.status,
      seller_id: item.seller_id
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Get my items error:", error);
    return res.status(500).json({ message: "Failed to load your items", error: error.message });
  }
};
