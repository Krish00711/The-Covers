const express = require('express');
const router = express.Router();
const { getTeams, getTeam } = require('../controllers/teamController');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', getTeams);
router.get('/:id', validateObjectId, getTeam);

module.exports = router;
