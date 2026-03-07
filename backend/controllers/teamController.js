const Team = require('../models/Team');

/**
 * @desc    Get all teams sorted by ICC ranking
 * @route   GET /api/v1/teams
 * @access  Public
 */
exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('captain', 'name country role')
      .sort({ iccRanking: 1 }); // Sort by ranking ascending (1 is best)
    
    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single team by ID
 * @route   GET /api/v1/teams/:id
 * @access  Public
 */
exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name country role batting bowling');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: team
    });
    
  } catch (error) {
    next(error);
  }
};
