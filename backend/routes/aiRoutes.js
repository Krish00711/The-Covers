const express = require('express');
const router = express.Router();
const { chatWithOracle } = require('../controllers/aiController');

// AI chat is now public
router.post('/chat', chatWithOracle);

module.exports = router;
