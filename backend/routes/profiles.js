const express = require('express');
const router = express.Router();
const { createProfile, getProfiles, updateProfile } = require('../controllers/profilesController');

router.post('/', createProfile);
router.get('/', getProfiles);
router.put('/:id', updateProfile);

module.exports = router;
