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

    const newItem = new WasteItem({
      seller_id: sellerId,
      title,
      category,
      approx_weight: Number(weight) || 0,
      base_price: Number(basePrice) || 0,
      address,
      city,
      pincode
    });

    const savedItem = await newItem.save();

    return res.status(201).json({
      message: "Waste item created",
      itemId: savedItem._id,
    });
  } catch (error) {
    console.error("Create waste item error:", error);
    return res.status(500).json({ message: "Failed to create item", error });
  }
};

// 2️⃣ BUYER: Get ALL open items with seller info
exports.getAllWasteItems = async (req, res) => {
  try {
    const items = await WasteItem.find({ status: 'OPEN' })
      .populate('seller_id', 'name email')
      .sort({ created_at: -1 });

    const formatted = items.map(item => ({
      id: item._id,
      title: item.title,
      category: item.category,
      approx_weight: item.approx_weight,
      base_price: item.base_price,
      address: item.address,
      city: item.city,
      pincode: item.pincode,
      seller_id: item.seller_id?._id,
      sellerName: item.seller_id?.name || "Unknown Seller",
      sellerEmail: item.seller_id?.email || ""
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Get all items error:", error);
    return res.status(500).json({ message: "Failed to load items", error });
  }
};

// 3️⃣ SELLER: Get ONLY my items
exports.getMyWasteItems = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const sellerId = req.user.id;

    const items = await WasteItem.find({ seller_id: sellerId })
      .sort({ created_at: -1 });

    const formatted = items.map(item => ({
      id: item._id,
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
    return res.status(500).json({ message: "Failed to load your items", error });
  }
};
