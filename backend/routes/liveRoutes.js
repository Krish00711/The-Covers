const express = require('express');
const router = express.Router();
const {
  getLiveMatches,
  getUpcomingMatches,
  getCurrentRankings,
  getMatchScorecard
} = require('../controllers/liveController');

router.get('/matches', getLiveMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/rankings', getCurrentRankings);
router.get('/scorecard/:id', getMatchScorecard);

module.exports = router;
