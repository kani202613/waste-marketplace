// backend/models/WasteItem.js
const mongoose = require('mongoose');

const WasteItemSchema = new mongoose.Schema({
  seller_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  approx_weight: { 
    type: Number, 
    default: 0 
  },
  base_price: { 
    type: Number, 
    default: 0 
  },
  image_url: { 
    type: String, 
    default: null 
  },
  address: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  pincode: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['OPEN', 'ACCEPTED', 'COMPLETED', 'CLOSED'], 
    default: 'OPEN' 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('WasteItem', WasteItemSchema);
