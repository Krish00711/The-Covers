const Match = require('../models/Match');
const Innings = require('../models/Innings');

/**
 * @desc    Get all matches with filters and pagination
 * @route   GET /api/v1/matches
 * @access  Public
 */
exports.getMatches = async (req, res, next) => {
  try {
    const { status, team, venue, year, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (team) {
      query.$or = [{ team1: team }, { team2: team }];
    }
    
    if (venue) {
      query.venue = venue;
    }
    
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query.startDate = { $gte: startDate, $lte: endDate };
    }
    
    // Execute query with pagination
    const matches = await Match.find(query)
      .populate('team1', 'name country')
      .populate('team2', 'name country')
      .populate('venue', 'name city country')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: -1 });
    
    // Get total count
    const count = await Match.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      },
      data: matches
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single match by ID with full details
 * @route   GET /api/v1/matches/:id
 * @access  Public
 */
exports.getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1', 'name country flagUrl')
      .populate('team2', 'name country flagUrl')
      .populate('venue', 'name city country pitchProfile')
      .populate('series', 'name')
      .populate('winningTeam', 'name')
      .populate('tossWinner', 'name')
      .populate('playerOfMatch', 'name country');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    // Get innings data
    const innings = await Innings.find({ match: match._id })
      .populate('battingTeam', 'name')
      .populate('bowlingTeam', 'name')
      .populate('battingScorecard.player', 'name')
      .populate('bowlingScorecard.player', 'name')
      .sort({ inningsNumber: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        ...match.toObject(),
        innings
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get matches from today in history
 * @route   GET /api/v1/matches/today-in-history
 * @access  Public
 */
exports.getTodayInHistory = async (req, res, next) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Find matches that started on this day in any year
    const matches = await Match.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$startDate' }, month] },
          { $eq: [{ $dayOfMonth: '$startDate' }, day] }
        ]
      }
    })
      .populate('team1', 'name country')
      .populate('team2', 'name country')
      .populate('venue', 'name city')
      .sort({ startDate: -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
    
  } catch (error) {
    next(error);
  }
};
