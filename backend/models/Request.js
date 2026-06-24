// backend/models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  buyer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  waste_item_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WasteItem', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'REJECTED'], 
    default: 'PENDING' 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Request', RequestSchema);
