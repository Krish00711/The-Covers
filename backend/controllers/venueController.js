const Venue = require('../models/Venue');
const Match = require('../models/Match');

/**
 * @desc    Get all venues with optional country filter
 * @route   GET /api/v1/venues
 * @access  Public
 */
exports.getVenues = async (req, res, next) => {
  try {
    const { country } = req.query;
    
    // Build query
    const query = {};
    if (country) {
      query.country = country;
    }
    
    // Get all venues
    const venues = await Venue.find(query).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: venues.length,
      data: venues
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single venue by ID with matches
 * @route   GET /api/v1/venues/:id
 * @access  Public
 */
exports.getVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }
    
    // Get matches played at this venue
    const matches = await Match.find({ venue: venue._id })
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('winningTeam', 'name')
      .sort({ startDate: -1 })
      .limit(50);
    
    res.status(200).json({
      success: true,
      data: {
        ...venue.toObject(),
        matches
      }
    });
    
  } catch (error) {
    next(error);
  }
};
