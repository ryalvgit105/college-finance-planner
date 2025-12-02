const express = require('express');
const router = express.Router();
const { evaluateCareerPaths } = require('../controllers/careerAdvisorController');

// POST /api/career-advisor/evaluate
router.post('/evaluate', evaluateCareerPaths);

module.exports = router;
