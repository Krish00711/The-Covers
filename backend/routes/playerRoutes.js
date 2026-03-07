const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getPlayer,
  getSimilarPlayers
} = require('../controllers/playerController');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', getPlayers);
router.get('/:id', validateObjectId, getPlayer);
router.get('/:id/similar', validateObjectId, getSimilarPlayers);

module.exports = router;
