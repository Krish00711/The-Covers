const Article = require('../models/Article');

/**
 * @desc    Get all articles with pagination and category filter
 * @route   GET /api/v1/articles
 * @access  Public
 */
exports.getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    
    // Build query
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Execute query with pagination
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude full content from list view
    
    // Get total count for pagination
    const total = await Article.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: articles
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single article by slug
 * @route   GET /api/v1/articles/:slug
 * @access  Public
 */
exports.getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    // Increment view count
    article.views += 1;
    await article.save();
    
    res.status(200).json({
      success: true,
      data: article
    });
    
  } catch (error) {
    next(error);
  }
};
