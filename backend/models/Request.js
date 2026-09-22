// backend/models/Request.js
const dbPromise = require('../config/db');

const RequestModel = {
  create: async (buyer_id, waste_item_id) => {
    const db = await dbPromise;
    const result = await db.run(
      `INSERT INTO requests (buyer_id, waste_item_id, status) VALUES (?, ?, 'PENDING')`,
      [buyer_id, waste_item_id]
    );
    return { id: result.lastID, buyer_id, waste_item_id, status: 'PENDING' };
  },

  findByBuyerAndItem: async (buyer_id, waste_item_id) => {
    const db = await dbPromise;
    return await db.get(
      `SELECT * FROM requests WHERE buyer_id = ? AND waste_item_id = ? LIMIT 1`,
      [buyer_id, waste_item_id]
    );
  },

  findByBuyer: async (buyer_id) => {
    const db = await dbPromise;
    return await db.all(`
      SELECT 
        r.id, r.waste_item_id, r.status, r.created_at,
        w.title, w.city, w.approx_weight, w.base_price
      FROM requests r
      JOIN waste_items w ON r.waste_item_id = w.id
      WHERE r.buyer_id = ?
      ORDER BY r.created_at DESC
    `, [buyer_id]);
  },

  findBySeller: async (seller_id) => {
    const db = await dbPromise;
    return await db.all(`
      SELECT 
        r.id, r.waste_item_id, r.status, r.created_at,
        w.title, w.approx_weight, w.base_price, w.city,
        u.name AS buyerName, u.email AS buyerEmail, u.phone AS buyerPhone
      FROM requests r
      JOIN waste_items w ON r.waste_item_id = w.id
      JOIN users u ON r.buyer_id = u.id
      WHERE w.seller_id = ?
      ORDER BY r.created_at DESC
    `, [seller_id]);
  },

  findByIdDetails: async (id) => {
    const db = await dbPromise;
    return await db.get(`
      SELECT r.id, r.status AS reqStatus, r.waste_item_id, w.seller_id
      FROM requests r
      JOIN waste_items w ON r.waste_item_id = w.id
      WHERE r.id = ? LIMIT 1
    `, [id]);
  },

  updateStatus: async (id, status) => {
    const db = await dbPromise;
    return await db.run(`UPDATE requests SET status = ? WHERE id = ?`, [status, id]);
  },

  rejectOthersForSameItem: async (waste_item_id, acceptedRequestId) => {
    const db = await dbPromise;
    return await db.run(
      `UPDATE requests SET status = 'REJECTED' WHERE waste_item_id = ? AND id != ? AND status = 'PENDING'`,
      [waste_item_id, acceptedRequestId]
    );
  }
};

module.exports = RequestModel;
