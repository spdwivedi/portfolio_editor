/**
 * FILE DETAILS: Collaboration Activity and Audit Logging Schema
 * -------------------------------------------------------------
 * This file establishes the Mongoose structural schema rules for the 'activitylogs' collection.
 * It acts as an automated security black-box recorder that tracks every single write operation 
 * performed inside the Studio Editor dashboard. This ensures that if you collaborate with others, 
 * you can audit exactly who made modifications, when they occurred, and what data nodes were changed.
 * It tracks:
 * 1. actionType: The type of transaction executed ('CREATE', 'UPDATE', 'SOFT_DELETE', 'RESTORE').
 * 2. targetType: The architectural collection affected ('Project' or 'Certificate').
 * 3. targetId: The direct MongoDB Object ID reference of the item that was altered.
 * 4. description: A clear, descriptive string explaining the exact event details.
 * 5. operator: The name or identity of the person who executed the action (defaults to 'Admin').
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'SOFT_DELETE', 'RESTORE'], // Enforces strict action taxonomy
        trim: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Project', 'Certificate'], // Tracks which schema type was modified
        trim: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType' // Dynamically links to either the Project or Certificate document pool
    },
    description: {
        type: String,
        required: true,
        trim: true // Example: "Soft-deleted project card: 'test project' and sent to Recycle Bin"
    },
    operator: {
        type: String,
        default: 'Admin', // Prepares the workspace for future collaborator team sign-ins
        trim: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false } // We only need 'createdAt' to mark the log's timeline history
});

// Export the compiled schema to handle active audit streams
module.exports = mongoose.model('ActivityLog', activityLogSchema);