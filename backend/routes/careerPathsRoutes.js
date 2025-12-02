const express = require('express');
const router = express.Router();
const { compareCareerPaths } = require('../controllers/careerPathsController');

router.post('/compare', compareCareerPaths);

module.exports = router;
