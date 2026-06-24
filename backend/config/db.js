// backend/config/db.js
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ Error: MONGO_URI is not defined in the environment variables.");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB database successfully'))
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err.message);
  });

module.exports = mongoose.connection;
