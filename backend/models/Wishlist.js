const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    text: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    emoji: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
});

const wishlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  products: [productSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Wishlist', wishlistSchema); 