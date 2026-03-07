const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  seriesType: {
    type: String,
    enum: ['bilateral', 'triangular', 'tournament'],
    required: true
  },
  hostCountry: String,
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }
}, {
  timestamps: true
});

// Indexes
seriesSchema.index({ startDate: -1 });
seriesSchema.index({ teams: 1 });

module.exports = mongoose.model('Series', seriesSchema);
