const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const requestController = require("../controllers/requestController");

// Buyer creates a request
router.post("/", authMiddleware, requestController.createRequest);

// Buyer sees their requests
router.get("/my", authMiddleware, requestController.getMyRequestsAsBuyer);

// Seller sees requests for their items
router.get("/seller", authMiddleware, requestController.getMyRequestsAsSeller);

// Update request status
router.put("/:id", authMiddleware, requestController.updateRequestStatus);

module.exports = router;
