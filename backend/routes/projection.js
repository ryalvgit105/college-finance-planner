const express = require('express');
const router = express.Router();
const { getProjection } = require('../controllers/projectionController');

// Routes
router.get('/', getProjection);

module.exports = router;
