const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * TimelineEvent Model - V4 Projection Engine
 * Represents future financial events that affect long-term projections
 * Separate from Milestone (Milestone = calendar events, TimelineEvent = financial projection events)
 */

const TimelineEventSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    yearOffset: {
        type: Number,
        required: true,
        comment: '0 = base year, 1 = next year, etc.'
    },
    type: {
        type: String,
        enum: [
            'income_change',
            'spending_change',
            'asset_add',
            'asset_sale',
            'debt_add',
            'debt_payoff',
            'investment_start',
            'investment_stop',
            'lifestyle_change',
            'career_path_change'
        ],
        required: true
    },
    payload: {
        type: Schema.Types.Mixed,
        default: {},
        comment: 'Flexible data structure for event-specific parameters (e.g., new income amount, asset value, etc.)'
    },
    source: {
        type: String,
        enum: ['user', 'ai_advisor', 'career_template'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries by userId and yearOffset
TimelineEventSchema.index({ userId: 1, yearOffset: 1 });
TimelineEventSchema.index({ userId: 1, type: 1 });

// Update the updatedAt timestamp on save
TimelineEventSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('TimelineEvent', TimelineEventSchema);
