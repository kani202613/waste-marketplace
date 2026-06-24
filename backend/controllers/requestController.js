// backend/controllers/requestController.js
const Request = require("../models/Request");
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

    // Check if waste item exists and is OPEN
    const item = await WasteItem.findById(waste_item_id);
    if (!item) {
      return res.status(404).json({ message: "Waste item not found." });
    }

    if (item.status !== "OPEN") {
      return res.status(400).json({ message: "This item is no longer available." });
    }

    if (item.seller_id.toString() === buyerId) {
      return res.status(400).json({ message: "You cannot request your own waste item." });
    }

    // Check if duplicate request already exists
    const existing = await Request.findOne({ buyer_id: buyerId, waste_item_id });
    if (existing) {
      return res.status(400).json({ message: "You have already sent a request for this item." });
    }

    // Create request
    const newRequest = new Request({
      buyer_id: buyerId,
      waste_item_id,
      status: 'PENDING'
    });

    const savedRequest = await newRequest.save();

    return res.status(201).json({
      message: "Request sent successfully.",
      requestId: savedRequest._id,
    });
  } catch (error) {
    console.error("Create request error:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

// 2. Buyer sees their own requests
exports.getMyRequestsAsBuyer = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const buyerId = req.user.id;

    const requests = await Request.find({ buyer_id: buyerId })
      .populate('waste_item_id')
      .sort({ created_at: -1 });

    const formatted = requests.map(r => ({
      id: r._id,
      waste_item_id: r.waste_item_id?._id,
      status: r.status,
      created_at: r.created_at,
      title: r.waste_item_id?.title || "Deleted Item",
      city: r.waste_item_id?.city || "",
      approx_weight: r.waste_item_id?.approx_weight || 0,
      base_price: r.waste_item_id?.base_price || 0
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Fetch buyer requests error:", error);
    return res.status(500).json({ message: "Failed to fetch requests.", error });
  }
};

// 3. Seller sees requests for their waste items
exports.getMyRequestsAsSeller = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const sellerId = req.user.id;

    const requests = await Request.find()
      .populate({
        path: 'waste_item_id',
        populate: { path: 'seller_id', select: '_id' }
      })
      .populate('buyer_id', 'name email phone')
      .sort({ created_at: -1 });

    // Filter requests where the item owner is this seller
    const sellerRequests = requests.filter(r => {
      return r.waste_item_id && 
             r.waste_item_id.seller_id && 
             r.waste_item_id.seller_id._id.toString() === sellerId;
    });

    const formatted = sellerRequests.map(r => ({
      id: r._id,
      waste_item_id: r.waste_item_id._id,
      status: r.status,
      created_at: r.created_at,
      title: r.waste_item_id.title,
      approx_weight: r.waste_item_id.approx_weight,
      base_price: r.waste_item_id.base_price,
      city: r.waste_item_id.city,
      buyerName: r.buyer_id?.name || "Unknown Buyer",
      buyerEmail: r.buyer_id?.email || "",
      buyerPhone: r.buyer_id?.phone || ""
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Fetch seller requests error:", error);
    return res.status(500).json({ message: "Failed to fetch requests.", error });
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
    const { status } = req.body; // e.g. 'ACCEPTED', 'REJECTED', 'COMPLETED'

    if (!status || !["ACCEPTED", "REJECTED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const request = await Request.findById(requestId).populate('waste_item_id');
    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (!request.waste_item_id) {
      return res.status(404).json({ message: "Associated waste item not found." });
    }

    // Verify user is the seller of the item
    if (request.waste_item_id.seller_id.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden. You are not the owner of this item." });
    }

    if (status === "ACCEPTED") {
      request.status = "ACCEPTED";
      await request.save();

      // Update waste item status to ACCEPTED
      await WasteItem.findByIdAndUpdate(request.waste_item_id._id, { status: "ACCEPTED" });

      // Auto-reject other pending requests for the same item
      await Request.updateMany(
        { 
          waste_item_id: request.waste_item_id._id, 
          _id: { $ne: request._id }, 
          status: "PENDING" 
        },
        { status: "REJECTED" }
      );

      return res.json({ message: "Request accepted, others declined." });

    } else if (status === "COMPLETED") {
      request.status = "COMPLETED";
      await request.save();

      // Update waste item status to CLOSED
      await WasteItem.findByIdAndUpdate(request.waste_item_id._id, { status: "CLOSED" });

      return res.json({ message: "Request and listing marked as completed." });

    } else if (status === "REJECTED") {
      request.status = "REJECTED";
      await request.save();

      return res.json({ message: "Request rejected successfully." });
    }
  } catch (error) {
    console.error("Update request status error:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};
