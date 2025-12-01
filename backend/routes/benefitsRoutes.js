const express = require('express');
const router = express.Router();
const { getBenefits, createOrUpdateBenefits, deleteBenefits } = require('../controllers/benefitsController');

router.get('/:profileId', getBenefits);
router.post('/', createOrUpdateBenefits);
router.delete('/:id', deleteBenefits);

module.exports = router;
