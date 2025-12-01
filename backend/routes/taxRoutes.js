const express = require('express');
const router = express.Router();
const { getTax, createOrUpdateTax, deleteTax } = require('../controllers/taxController');

router.get('/:profileId', getTax);
router.post('/', createOrUpdateTax);
router.delete('/:id', deleteTax);

module.exports = router;
