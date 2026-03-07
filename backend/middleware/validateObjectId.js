const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'No ID parameter provided'
    });
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: `Invalid ID format: ${id}. Please provide a valid MongoDB ObjectId.`
    });
  }
  
  next();
};

module.exports = validateObjectId;
