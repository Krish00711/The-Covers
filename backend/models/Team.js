const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    unique: true
  },
  iccRanking: Number,
  flagUrl: String,
  founded: Number,
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  coach: String,
  stats: {
    matchesPlayed: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    drawn: { type: Number, default: 0 },
    tied: { type: Number, default: 0 },
    winPercentage: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
teamSchema.index({ name: 1 }, { unique: true });
teamSchema.index({ country: 1 }, { unique: true });
teamSchema.index({ iccRanking: 1 });

module.exports = mongoose.model('Team', teamSchema);
