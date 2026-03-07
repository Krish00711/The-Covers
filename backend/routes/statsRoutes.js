const express = require('express');
const router = express.Router();
const {
  getRecords,
  getRankings,
  getHeadToHead,
  getEraStats
} = require('../controllers/statsController');

router.get('/records', getRecords);
router.get('/rankings', getRankings);
router.get('/head-to-head', getHeadToHead);
router.get('/era/:era', getEraStats);

module.exports = router;
