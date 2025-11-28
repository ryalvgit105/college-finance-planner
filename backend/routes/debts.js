const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { createDebt, getAllDebts } = require('../controllers/debtsController');

// Validation middleware for creating debts
const validateDebt = [
    body('type')
        .trim()
        .notEmpty()
        .withMessage('Debt type is required')
        .isLength({ max: 100 })
        .withMessage('Debt type cannot exceed 100 characters'),
    body('balance')
        .notEmpty()
        .withMessage('Balance is required')
        .isNumeric()
        .withMessage('Balance must be a number')
        .custom((value) => value >= 0)
        .withMessage('Balance must be a positive number'),
    body('interestRate')
        .optional()
        .isNumeric()
        .withMessage('Interest rate must be a number')
        .custom((value) => value >= 0 && value <= 100)
        .withMessage('Interest rate must be between 0 and 100'),
    body('monthlyPayment')
        .optional()
        .isNumeric()
        .withMessage('Monthly payment must be a number')
        .custom((value) => value >= 0)
        .withMessage('Monthly payment must be a positive number'),
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
router.post('/', validateDebt, handleValidationErrors, createDebt);
router.get('/', getAllDebts);

module.exports = router;
