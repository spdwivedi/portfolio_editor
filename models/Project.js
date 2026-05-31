/**
 * FILE DETAILS: Futuristic Asymmetric Data Schema Definition for Portfolio Projects
 * -------------------------------------------------------------------
 * This file configures the structural validation rules for your MongoDB collections.
 * Synchronized across both terminal clusters to support dynamic aura presentation nodes:
 * 1. Project Specifications: Title, Category tracking, and Markdown descriptions.
 * 2. Visual Layout Matrix: Dynamic size definitions for complex multi-column grid layouts.
 * 3. State Infrastructure: Soft-deletion state boundaries for Recycle Bin protection.
 * 4. Ambient Branding Properties: Stores dynamic brand hex codes and engine profiles
 * to drive webpage color-morphing layouts automatically on hover states.
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tags: {
        type: [String],
        default: []
    },
    links: {
        github: {
            type: String,
            trim: true,
            default: ''
        },
        liveUrl: {
            type: String,
            trim: true,
            default: ''
        },
        datasetUrl: {
            type: String,
            trim: true,
            default: ''
        }
    },
    layout: {
        size: {
            type: String,
            enum: ['normal', 'wide-block', 'large-block', 'tall-block'],
            default: 'normal'
        },
        orderIndex: {
            type: Number,
            default: 0
        }
    },
    // FUTURISTIC AMBIENT SKINS CHANNELS
    accentColor: {
        type: String,
        default: '#00f2ea',
        trim: true
    },
    hoverAnimation: {
        type: String,
        default: 'aura-glow',
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);