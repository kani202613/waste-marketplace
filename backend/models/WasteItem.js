// backend/models/WasteItem.js
const db = require('../config/db');

const WasteItem = {
  create: (data, callback) => {
    const {
      seller_id,
      title,
      category,
      approx_weight,
      base_price,
      image_url,
      address,
      city,
      pincode
    } = data;

    const sql = `
      INSERT INTO waste_items
      (seller_id, title, category, approx_weight, base_price, image_url, address, city, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [seller_id, title, category, approx_weight, base_price, image_url, address, city, pincode],
      (err, result) => {
        if (err) return callback(err);
        callback(null, { id: result.insertId, ...data, status: 'OPEN' });
      }
    );
  },

  findBySeller: (sellerId, callback) => {
    const sql = `SELECT * FROM waste_items WHERE seller_id = ? ORDER BY created_at DESC`;
    db.query(sql, [sellerId], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  findAllOpen: (callback) => {
    const sql = `SELECT * FROM waste_items WHERE status = 'OPEN' ORDER BY created_at DESC`;
    db.query(sql, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  }
};

module.exports = WasteItem;
