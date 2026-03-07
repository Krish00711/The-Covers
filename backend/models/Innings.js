const mongoose = require('mongoose');

const inningsSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  inningsNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  battingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  bowlingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  totalRuns: {
    type: Number,
    required: true
  },
  totalWickets: {
    type: Number,
    required: true
  },
  overs: {
    type: Number,
    required: true
  },
  declared: {
    type: Boolean,
    default: false
  },
  forfeited: {
    type: Boolean,
    default: false
  },
  extras: {
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 },
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 }
  },
  battingScorecard: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    runs: Number,
    balls: Number,
    fours: Number,
    sixes: Number,
    strikeRate: Number,
    dismissal: String,
    position: Number
  }],
  bowlingScorecard: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    },
    overs: Number,
    maidens: Number,
    runs: Number,
    wickets: Number,
    economy: Number
  }],
  fallOfWickets: [{
    wicket: Number,
    runs: Number,
    overs: Number,
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }
  }],
  sessionData: [{
    session: {
      type: String,
      enum: ['session1', 'session2', 'session3']
    },
    day: Number,
    runs: Number,
    wickets: Number,
    overs: Number
  }]
}, {
  timestamps: true
});

// Compound unique index
inningsSchema.index({ match: 1, inningsNumber: 1 }, { unique: true });

module.exports = mongoose.model('Innings', inningsSchema);
