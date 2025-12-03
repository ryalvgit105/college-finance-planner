const express = require('express');
const router = express.Router();
const { compareCareerPaths, getCareerPathTemplates } = require('../controllers/careerPathsController');

router.get('/templates', getCareerPathTemplates);
router.post('/compare', compareCareerPaths);

module.exports = router;
