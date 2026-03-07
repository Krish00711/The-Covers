const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['analysis', 'history', 'features', 'opinion'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  tags: [String],
  featuredImage: String,
  readTime: Number,
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ category: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ title: 'text' });

module.exports = mongoose.model('Article', articleSchema);
