const cricapiService = require('../services/cricapiService');

/**
 * @desc    Get current live Test matches
 * @route   GET /api/v1/live/matches
 * @access  Public
 */
exports.getLiveMatches = async (req, res, next) => {
  try {
    const matches = await cricapiService.getLiveMatches();
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    // Return empty array instead of error
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
};

/**
 * @desc    Get upcoming Test matches
 * @route   GET /api/v1/live/upcoming
 * @access  Public
 */
exports.getUpcomingMatches = async (req, res, next) => {
  try {
    const matches = await cricapiService.getUpcomingMatches();
    
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    // Return empty array instead of error
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
};

/**
 * @desc    Get current ICC Test rankings
 * @route   GET /api/v1/live/rankings
 * @access  Public
 */
exports.getCurrentRankings = async (req, res, next) => {
  try {
    const rankings = await cricapiService.getCurrentRankings();
    
    res.status(200).json({
      success: true,
      count: rankings.length,
      data: rankings
    });
  } catch (error) {
    // Return empty array instead of error
    res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
};

/**
 * @desc    Get match scorecard by ID
 * @route   GET /api/v1/live/scorecard/:id
 * @access  Public
 */
exports.getMatchScorecard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scorecard = await cricapiService.getMatchScorecard(id);
    
    if (!scorecard) {
      return res.status(404).json({
        success: false,
        error: 'Scorecard not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: scorecard
    });
  } catch (error) {
    // Return 404 instead of error
    res.status(404).json({
      success: false,
      error: 'Scorecard not available'
    });
  }
};
