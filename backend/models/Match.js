const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchNumber: {
    type: Number,
    unique: true,
    required: true
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  result: {
    type: String,
    enum: ['team1_won', 'team2_won', 'draw', 'tie', 'abandoned']
  },
  winningTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  winMargin: String,
  tossWinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  tossDecision: {
    type: String,
    enum: ['bat', 'field']
  },
  umpires: [String],
  referee: String,
  innings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Innings'
  }],
  playerOfMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'abandoned'],
    default: 'scheduled'
  },
  narrative: String
}, {
  timestamps: true
});

// Indexes
matchSchema.index({ matchNumber: 1 }, { unique: true });
matchSchema.index({ startDate: -1 });
matchSchema.index({ venue: 1 });
matchSchema.index({ team1: 1, team2: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model('Match', matchSchema);
