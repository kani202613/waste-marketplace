// backend/controllers/requestController.js
const RequestModel = require("../models/Request");
const WasteItem = require("../models/WasteItem");

// 1. Buyer creates a request for a waste item
exports.createRequest = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const buyerId = req.user.id;
    const { waste_item_id } = req.body;

    if (!waste_item_id) {
      return res.status(400).json({ message: "Waste item ID is required." });
    }

    const item = await WasteItem.findById(waste_item_id);
    if (!item) {
      return res.status(404).json({ message: "Waste item not found." });
    }

    if (item.status !== "OPEN") {
      return res.status(400).json({ message: "This item is no longer available." });
    }

    if (item.seller_id === buyerId) {
      return res.status(400).json({ message: "You cannot request your own waste item." });
    }

    const existing = await RequestModel.findByBuyerAndItem(buyerId, waste_item_id);
    if (existing) {
      return res.status(400).json({ message: "You have already sent a request for this item." });
    }

    const newRequest = await RequestModel.create(buyerId, waste_item_id);

    return res.status(201).json({
      message: "Request sent successfully.",
      requestId: newRequest.id,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// 2. Buyer sees their own requests
exports.getMyRequestsAsBuyer = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const buyerId = req.user.id;
    const requests = await RequestModel.findByBuyer(buyerId);

    const formatted = requests.map(r => ({
      id: r.id,
      waste_item_id: r.waste_item_id,
      status: r.status,
      created_at: r.created_at,
      title: r.title || "Deleted Item",
      city: r.city || "",
      approx_weight: r.approx_weight || 0,
      base_price: r.base_price || 0
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Fetch buyer requests error:", error);
    return res.status(500).json({ message: "Failed to fetch requests.", error: error.message });
  }
};

// 3. Seller sees requests for their waste items
exports.getMyRequestsAsSeller = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const sellerId = req.user.id;
    const requests = await RequestModel.findBySeller(sellerId);

    const formatted = requests.map(r => ({
      id: r.id,
      waste_item_id: r.waste_item_id,
      status: r.status,
      created_at: r.created_at,
      title: r.title,
      approx_weight: r.approx_weight,
      base_price: r.base_price,
      city: r.city,
      buyerName: r.buyerName || "Unknown Buyer",
      buyerEmail: r.buyerEmail || "",
      buyerPhone: r.buyerPhone || ""
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Fetch seller requests error:", error);
    return res.status(500).json({ message: "Failed to fetch requests.", error: error.message });
  }
};

// 4. Update request status (Accept / Reject / Complete)
exports.updateRequestStatus = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const userId = req.user.id;
    const requestId = req.params.id;
    const { status } = req.body;

    if (!status || !["ACCEPTED", "REJECTED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const requestDetails = await RequestModel.findByIdDetails(requestId);
    if (!requestDetails) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (requestDetails.seller_id !== userId) {
      return res.status(403).json({ message: "Forbidden. You are not the owner of this item." });
    }

    if (status === "ACCEPTED") {
      await RequestModel.updateStatus(requestId, "ACCEPTED");
      await WasteItem.updateStatus(requestDetails.waste_item_id, "ACCEPTED");
      await RequestModel.rejectOthersForSameItem(requestDetails.waste_item_id, requestId);

      return res.json({ message: "Request accepted, others declined." });

    } else if (status === "COMPLETED") {
      await RequestModel.updateStatus(requestId, "COMPLETED");
      await WasteItem.updateStatus(requestDetails.waste_item_id, "CLOSED");

      return res.json({ message: "Request and listing marked as completed." });

    } else if (status === "REJECTED") {
      await RequestModel.updateStatus(requestId, "REJECTED");

      return res.json({ message: "Request rejected successfully." });
    }
  } catch (error) {
    console.error("Update request status error:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};
