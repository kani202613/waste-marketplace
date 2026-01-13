// backend/controllers/requestController.js

// Buyer creates a request
exports.createRequest = (req, res) => {
  // later you can connect this to DB
  return res.status(201).json({ message: "Request created (stub)" });
};

// Buyer sees their own requests
exports.getMyRequestsAsBuyer = (req, res) => {
  // later: fetch from DB using req.user.id
  return res.json({ message: "My buyer requests (stub)", data: [] });
};

// Seller sees requests for their items
exports.getMyRequestsAsSeller = (req, res) => {
  // later: fetch from DB using req.user.id
  return res.json({ message: "My seller requests (stub)", data: [] });
};
