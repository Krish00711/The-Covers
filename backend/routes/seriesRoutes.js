const express = require('express');
const router = express.Router();
const { getSeries, getSeriesById } = require('../controllers/seriesController');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', getSeries);
router.get('/:id', validateObjectId, getSeriesById);

module.exports = router;
