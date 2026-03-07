const express = require('express');
const router = express.Router();
const {
  getMatches,
  getMatch,
  getTodayInHistory
} = require('../controllers/matchController');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', getMatches);
router.get('/today-in-history', getTodayInHistory);
router.get('/:id', validateObjectId, getMatch);

module.exports = router;
