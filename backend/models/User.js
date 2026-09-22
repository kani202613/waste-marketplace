// backend/models/User.js
const dbPromise = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const db = await dbPromise;
    return await db.get('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  },

  findById: async (id) => {
    const db = await dbPromise;
    return await db.get('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  },

  create: async (userData) => {
    const db = await dbPromise;
    const { name, email, password, role, phone, address, city, pincode } = userData;
    const result = await db.run(
      `INSERT INTO users (name, email, password, role, phone, address, city, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, password, role || 'seller', phone || null, address || null, city || null, pincode || null]
    );
    return { id: result.lastID, name, email, role: role || 'seller' };
  },

  findAll: async () => {
    const db = await dbPromise;
    return await db.all('SELECT id, name, email, role, phone, city, address, pincode FROM users');
  }
};

module.exports = User;
