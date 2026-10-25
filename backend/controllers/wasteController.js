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
      return res.status(400).json({ message: "All fields are required (title, category, weight, basePrice, address, city, pincode)." });
    }

    const trimmedTitle = String(title).trim();
    const trimmedCategory = String(category).trim();
    const trimmedAddress = String(address).trim();
    const trimmedCity = String(city).trim();
    const trimmedPincode = String(pincode).trim();

    if (!trimmedTitle || !trimmedCategory || !trimmedAddress || !trimmedCity || !trimmedPincode) {
      return res.status(400).json({ message: "Field values cannot be blank." });
    }

    const numWeight = Number(weight);
    const numPrice = Number(basePrice);

    if (isNaN(numWeight) || numWeight <= 0) {
      return res.status(400).json({ message: "Approximate weight must be a positive number." });
    }

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: "Base price must be zero or a positive number." });
    }

    const created = await WasteItem.create({
      seller_id: sellerId,
      title: trimmedTitle,
      category: trimmedCategory,
      approx_weight: numWeight,
      base_price: numPrice,
      address: trimmedAddress,
      city: trimmedCity,
      pincode: trimmedPincode
    });

    return res.status(201).json({
      message: "Waste item listed successfully",
      itemId: created.id,
    });
  } catch (error) {
    console.error("Create waste item error:", error);
    return res.status(500).json({ message: "Failed to create item", error: error.message });
  }
};

// 2️⃣ BUYER: Get ALL open items with seller info (Supports category, city, search, sort & limit)
exports.getAllWasteItems = async (req, res) => {
  try {
    const { category, city, search, sort, limit } = req.query;
    const queryLimit = parseInt(limit) || 1000;

    const items = await WasteItem.findAllOpen({
      category,
      city,
      search,
      sort,
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

// 4️⃣ SELLER: Delete my waste listing
exports.deleteWasteItem = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    const itemId = req.params.id;
    const sellerId = req.user.id;

    const item = await WasteItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Waste item not found." });
    }

    if (item.seller_id !== sellerId) {
      return res.status(403).json({ message: "Forbidden. You can only delete your own listings." });
    }

    if (item.status === 'ACCEPTED') {
      return res.status(400).json({ message: "Cannot delete an item with an accepted collection request in progress." });
    }

    await WasteItem.deleteById(itemId, sellerId);
    return res.json({ message: "Listing deleted successfully." });
  } catch (error) {
    console.error("Delete waste item error:", error);
    return res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
};
