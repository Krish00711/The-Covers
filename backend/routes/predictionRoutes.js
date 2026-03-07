const express = require('express');
const router = express.Router();
const {
  predictMatch,
  predictScore,
  predictXI,
  predictSimilarPlayers
} = require('../controllers/predictionController');

// All prediction routes are now public
router.post('/match', predictMatch);
router.post('/score', predictScore);
router.post('/xi', predictXI);
router.post('/similar-players', predictSimilarPlayers);

module.exports = router;
