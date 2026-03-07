const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  role: {
    type: String,
    enum: ['batsman', 'bowler', 'allrounder', 'wicketkeeper'],
    required: true
  },
  batting: {
    style: {
      type: String,
      enum: ['right-hand', 'left-hand']
    },
    matches: { type: Number, default: 0 },
    innings: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    centuries: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    highScore: { type: Number, default: 0 }
  },
  bowling: {
    style: {
      type: String,
      enum: ['fast', 'medium', 'spin-off', 'spin-leg', 'spin-orthodox']
    },
    matches: { type: Number, default: 0 },
    innings: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    fiveWickets: { type: Number, default: 0 },
    tenWickets: { type: Number, default: 0 },
    bestInnings: { type: String }
  },
  fielding: {
    catches: { type: Number, default: 0 },
    stumpings: { type: Number, default: 0 }
  },
  debut: Date,
  lastPlayed: Date,
  active: {
    type: Boolean,
    default: true
  },
  imageUrl: String,
  bio: String
}, {
  timestamps: true
});

// Indexes
playerSchema.index({ name: 'text' });
playerSchema.index({ country: 1 });
playerSchema.index({ role: 1 });
playerSchema.index({ 'batting.average': -1 });
playerSchema.index({ 'bowling.average': 1 });

module.exports = mongoose.model('Player', playerSchema);
