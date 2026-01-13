// backend/models/User.js
const db = require('../config/db');

const User = {
  findByEmail: (email, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    db.query(sql, [email], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]); // undefined if not found
    });
  },

  create: (userData, callback) => {
    const { name, email, passwordHash, role, phone, address, city, pincode } = userData;
    const sql = `
      INSERT INTO users (name, email, password, role, phone, address, city, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [name, email, passwordHash, role, phone, address, city, pincode],
      (err, result) => {
        if (err) return callback(err);
        callback(null, { id: result.insertId, ...userData });
      }
    );
  }
};

module.exports = User;
