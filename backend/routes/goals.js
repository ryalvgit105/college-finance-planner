const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { createGoal, getAllGoals } = require('../controllers/goalsController');

// Validation middleware for goals
const validateGoal = [
    body('goalName')
        .trim()
        .notEmpty()
        .withMessage('Goal name is required')
        .isLength({ max: 200 })
        .withMessage('Goal name cannot exceed 200 characters'),
    body('targetAmount')
        .notEmpty()
        .withMessage('Target amount is required')
        .isNumeric()
        .withMessage('Target amount must be a number')
        .custom((value) => value >= 0)
        .withMessage('Target amount must be a positive number'),
    body('targetDate')
        .notEmpty()
        .withMessage('Target date is required')
        .isISO8601()
        .withMessage('Target date must be a valid date'),
    body('monthlyBudget')
        .notEmpty()
        .withMessage('Monthly budget is required')
        .isNumeric()
        .withMessage('Monthly budget must be a number')
        .custom((value) => value >= 0)
        .withMessage('Monthly budget must be a positive number'),
    body('categories')
        .optional()
        .isObject()
        .withMessage('Categories must be an object')
        .custom((obj) => {
            // Validate all values are positive numbers
            for (let key in obj) {
                if (typeof obj[key] !== 'number' || obj[key] < 0) {
                    return false;
                }
            }
            return true;
        })
        .withMessage('All category values must be positive numbers'),
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
router.post('/', validateGoal, handleValidationErrors, createGoal);
router.get('/', getAllGoals);

module.exports = router;
