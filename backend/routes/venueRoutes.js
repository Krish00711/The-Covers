const express = require('express');
const router = express.Router();
const {
  getVenues,
  getVenue
} = require('../controllers/venueController');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', getVenues);
router.get('/:id', validateObjectId, getVenue);

module.exports = router;
