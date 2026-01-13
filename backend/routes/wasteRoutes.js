// backend/routes/wasteRoutes.js
const express = require("express");
const router = express.Router();

const wasteController = require("../controllers/wasteController");

// POST /api/waste
router.post("/", wasteController.createWasteItem);

// GET /api/waste
router.get("/", wasteController.getAllWasteItems);

// GET /api/waste/my
router.get("/my", wasteController.getMyWasteItems);

module.exports = router;
