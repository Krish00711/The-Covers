const Series = require('../models/Series');

/**
 * @desc    Get all series with pagination
 * @route   GET /api/v1/series
 * @access  Public
 */
exports.getSeries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const series = await Series.find()
      .populate('teams', 'name country flagUrl')
      .populate('winner', 'name country')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Series.countDocuments();
    
    res.status(200).json({
      success: true,
      count: series.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: series
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single series by ID
 * @route   GET /api/v1/series/:id
 * @access  Public
 */
exports.getSeriesById = async (req, res, next) => {
  try {
    const series = await Series.findById(req.params.id)
      .populate('teams', 'name country flagUrl iccRanking')
      .populate('matches', 'matchNumber team1 team2 venue startDate result')
      .populate('winner', 'name country');
    
    if (!series) {
      return res.status(404).json({
        success: false,
        error: 'Series not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: series
    });
    
  } catch (error) {
    next(error);
  }
};
