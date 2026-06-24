// backend/routes/wasteRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const wasteController = require("../controllers/wasteController");

// POST /api/waste
router.post("/", authMiddleware, wasteController.createWasteItem);

// GET /api/waste
router.get("/", authMiddleware, wasteController.getAllWasteItems);

// GET /api/waste/my
router.get("/my", authMiddleware, wasteController.getMyWasteItems);

module.exports = router;
