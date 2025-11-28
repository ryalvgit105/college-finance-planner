const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { logSpending, getWeeklyBreakdown } = require('../controllers/spendingController');

// Validation middleware for logging spending
const validateSpending = [
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isLength({ max: 50 })
        .withMessage('Category cannot exceed 50 characters'),
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => value >= 0)
        .withMessage('Amount must be a positive number'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
];

// Validation middleware for weekly breakdown query
const validateWeekQuery = [
    query('start')
        .notEmpty()
        .withMessage('Start date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Start date must be in YYYY-MM-DD format')
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
router.post('/', validateSpending, handleValidationErrors, logSpending);
router.get('/week', validateWeekQuery, handleValidationErrors, getWeeklyBreakdown);

module.exports = router;
