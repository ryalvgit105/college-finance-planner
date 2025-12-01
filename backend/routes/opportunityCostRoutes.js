const express = require('express');
const router = express.Router();
const { comparePaths, getTemplates } = require('../controllers/opportunityCostController');

router.post('/compare', comparePaths);
router.get('/templates', getTemplates);

module.exports = router;
