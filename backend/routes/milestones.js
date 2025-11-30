const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { createMilestone, getMilestones, updateMilestone } = require('../controllers/milestonesController');

// Validation middleware for creating milestones
const validateMilestone = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('expectedCost')
        .optional()
        .isNumeric()
        .withMessage('Expected cost must be a number')
        .custom((value) => value >= 0)
        .withMessage('Expected cost must be a positive number'),
    body('relatedGoalId')
        .optional()
        .isMongoId()
        .withMessage('Related goal ID must be a valid MongoDB ObjectId')
];

// Validation middleware for month query parameter
const validateMonthQuery = [
    query('month')
        .optional()
        .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
        .withMessage('Month must be in YYYY-MM format (e.g., 2025-12)')
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
router.post('/', validateMilestone, handleValidationErrors, createMilestone);
router.get('/', validateMonthQuery, handleValidationErrors, getMilestones);
router.patch('/:id', handleValidationErrors, updateMilestone);

module.exports = router;
