// backend/models/WasteItem.js
const dbPromise = require('../config/db');

const WasteItem = {
  create: async (data) => {
    const db = await dbPromise;
    const { seller_id, title, category, approx_weight, base_price, address, city, pincode } = data;
    const result = await db.run(
      `INSERT INTO waste_items (seller_id, title, category, approx_weight, base_price, address, city, pincode, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [seller_id, title, category, approx_weight || 0, base_price || 0, address, city, pincode]
    );
    return { id: result.lastID, ...data, status: 'OPEN' };
  },

  findAllOpen: async ({ category, city, search, limit } = {}) => {
    const db = await dbPromise;
    let sql = `
      SELECT 
        w.id, w.seller_id, w.title, w.category, w.approx_weight, w.base_price, 
        w.address, w.city, w.pincode, w.status, w.created_at,
        u.name AS sellerName, u.email AS sellerEmail
      FROM waste_items w
      JOIN users u ON w.seller_id = u.id
      WHERE w.status = 'OPEN'
    `;
    const params = [];

    if (category && category !== 'All') {
      sql += ` AND w.category = ?`;
      params.push(category);
    }

    if (city && city !== 'All') {
      sql += ` AND w.city = ?`;
      params.push(city);
    }

    if (search) {
      sql += ` AND (w.title LIKE ? OR w.category LIKE ? OR w.city LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ` ORDER BY w.created_at DESC`;

    if (limit) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }

    return await db.all(sql, params);
  },

  findBySeller: async (sellerId) => {
    const db = await dbPromise;
    return await db.all(`SELECT * FROM waste_items WHERE seller_id = ? ORDER BY created_at DESC`, [sellerId]);
  },

  findById: async (id) => {
    const db = await dbPromise;
    return await db.get(`SELECT * FROM waste_items WHERE id = ? LIMIT 1`, [id]);
  },

  updateStatus: async (id, status) => {
    const db = await dbPromise;
    return await db.run(`UPDATE waste_items SET status = ? WHERE id = ?`, [status, id]);
  }
};

module.exports = WasteItem;
