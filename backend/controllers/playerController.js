const Player = require('../models/Player');

/**
 * @desc    Get all players with filters and pagination
 * @route   GET /api/v1/players
 * @access  Public
 */
exports.getPlayers = async (req, res, next) => {
  try {
    const { country, role, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (country && country !== 'all') {
      query.country = country;
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Execute query with pagination
    const players = await Player.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'batting.average': -1 });
    
    // Get total count
    const count = await Player.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      },
      data: players
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single player by ID
 * @route   GET /api/v1/players/:id
 * @access  Public
 */
exports.getPlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: player
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get similar players (ML-powered)
 * @route   GET /api/v1/players/:id/similar
 * @access  Public
 */
exports.getSimilarPlayers = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }
    
    // TODO: Call ML service for similar players
    // For now, return players with similar role and stats
    const similarPlayers = await Player.find({
      _id: { $ne: player._id },
      role: player.role,
      'batting.average': {
        $gte: player.batting.average - 10,
        $lte: player.batting.average + 10
      }
    }).limit(5);
    
    res.status(200).json({
      success: true,
      data: similarPlayers
    });
    
  } catch (error) {
    next(error);
  }
};
