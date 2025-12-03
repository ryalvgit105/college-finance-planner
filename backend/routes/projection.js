const express = require('express');
const router = express.Router();
const { getProjection, getV4Projection } = require('../controllers/projectionController');

// Routes
router.get('/', getProjection);
router.post('/v4', getV4Projection);

module.exports = router;
