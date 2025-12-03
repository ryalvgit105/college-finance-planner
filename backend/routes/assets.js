const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { createAsset, getAllAssets, updateAsset, deleteAsset } = require('../controllers/assetsController');

// Validation middleware
const validateAsset = [
    body('type')
        .notEmpty()
        .withMessage('Asset type is required')
        .isLength({ max: 100 })
        .withMessage('Asset type cannot exceed 100 characters'),
    body('value')
        .notEmpty()
        .withMessage('Asset value is required')
        .isNumeric()
        .withMessage('Asset value must be a number')
        .custom((value) => value >= 0)
        .withMessage('Asset value must be a positive number'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Routes
router.post('/', validateAsset, handleValidationErrors, createAsset);
router.get('/', getAllAssets);
router.put('/:id', validateAsset, handleValidationErrors, updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
