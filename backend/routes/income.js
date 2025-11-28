const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { createOrUpdateIncome, getIncome } = require('../controllers/incomeController');

// Validation middleware for income/career data
const validateIncome = [
    body('currentIncome')
        .notEmpty()
        .withMessage('Current income is required')
        .isNumeric()
        .withMessage('Current income must be a number')
        .custom((value) => value >= 0)
        .withMessage('Current income must be a positive number'),
    body('incomeSources')
        .optional()
        .isArray()
        .withMessage('Income sources must be an array')
        .custom((arr) => {
            if (arr && arr.length > 0) {
                return arr.every(source => typeof source === 'string' && source.trim().length > 0);
            }
            return true;
        })
        .withMessage('Income sources must be non-empty strings'),
    body('careerGoal')
        .trim()
        .notEmpty()
        .withMessage('Career goal is required')
        .isLength({ max: 200 })
        .withMessage('Career goal cannot exceed 200 characters'),
    body('projectedSalary')
        .optional()
        .isNumeric()
        .withMessage('Projected salary must be a number')
        .custom((value) => value >= 0)
        .withMessage('Projected salary must be a positive number'),
    body('educationRequired')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Education required cannot exceed 300 characters'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes cannot exceed 1000 characters')
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
router.post('/', validateIncome, handleValidationErrors, createOrUpdateIncome);
router.get('/', getIncome);

module.exports = router;
