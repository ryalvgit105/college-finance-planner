const express = require('express');
const router = express.Router();
const snapshotController = require('../controllers/snapshotController');

// @route   GET /api/snapshots/:type/history
// @desc    Get snapshot history for a specific type and year
router.get('/:type/history', snapshotController.getHistory);

// @route   POST /api/snapshots/capture
// @desc    Capture current state as a snapshot
router.post('/capture', snapshotController.captureSnapshot);

// @route   GET /api/snapshots/detail
// @desc    Get detailed snapshot for a specific month
router.get('/detail', snapshotController.getSnapshotDetail);

// @route   GET /api/snapshots/test-helpers/profile-id
// @desc    Get a valid profile ID for testing
router.get('/test-helpers/profile-id', snapshotController.getTestProfileId);

module.exports = router;
