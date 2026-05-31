/**
 * FILE DETAILS: Data Schema Definition for Professional Certifications
 * ---------------------------------------------------------------------
 * This file establishes the Mongoose structural schema rules for the 'certificates' collection.
 * It maps professional courses, specializations, and training programs to MongoDB documents, configuring:
 * 1. Course Title (Text property specifying the name of the credential earned).
 * 2. Platform Entity (String representation of the educational provider, e.g., Coursera, Udemy).
 * 3. Completion Timeline (Numeric string or number tracking the specific year of completion).
 * 4. Verification Hyperlink (Direct web url to securely validate the credential's authenticity).
 */

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    platform: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true
    },
    verifyUrl: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true // Tracks database entry generation timestamps automatically
});

// Export the compiled schema to serve as our runtime Certificate database accessor model
module.exports = mongoose.model('Certificate', certificateSchema);