const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  capacity: Number,
  established: Number,
  pitchProfile: {
    spinFriendly: {
      type: Number,
      min: 0,
      max: 100
    },
    paceFriendly: {
      type: Number,
      min: 0,
      max: 100
    },
    avgFirstInningsScore: Number,
    characteristics: String
  },
  historicMoments: [{
    title: String,
    description: String,
    date: Date,
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    }
  }],
  matchesPlayed: {
    type: Number,
    default: 0
  },
  imageUrl: String
}, {
  timestamps: true
});

// Indexes
venueSchema.index({ name: 1 }, { unique: true });
venueSchema.index({ country: 1 });
venueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Venue', venueSchema);
