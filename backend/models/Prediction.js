const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  predictionType: {
    type: String,
    enum: ['match_result', 'score_range', 'best_xi', 'similar_players'],
    required: true
  },
  inputParameters: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  modelVersion: String
}, {
  timestamps: true
});

// Indexes
predictionSchema.index({ user: 1 });
predictionSchema.index({ predictionType: 1 });
predictionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
