/**
 * FILE DETAILS: Granular Per-Page Telemetry Validation Matrix Database Schema
 * ----------------------------------------------------------------------------
 * This file re-engineers your MongoDB schema validation profiles to allow high-density
 * structural tuning arrays. It introduces independent page configuration tracks, 
 * time interval trackers, and density counters to handle fine-grained VFX management.
 */

const mongoose = require('mongoose');

// Sub-document configuration blueprint for highly granular per-page asset state tracking
const pageConfigSchema = new mongoose.Schema({
    marioEnabled: { type: Boolean, default: true },
    ironManEnabled: { type: Boolean, default: true },
    thorEnabled: { type: Boolean, default: true },
    jetsEnabled: { type: Boolean, default: true },
    starsEnabled: { type: Boolean, default: true },
    fireworksEnabled: { type: Boolean, default: true }
}, { _id: false });

const settingSchema = new mongoose.Schema({
    // 1. MASTER WORKSPACE CONFIGURATION TRACKERS
    vfxEngineActive: { type: Boolean, default: true },
    systemExecutionMode: { type: String, enum: ['ambient', 'serial-test'], default: 'ambient' },

    // 2. GRANULAR TIMER SCHEDULERS & INTERVAL CORES (Minute Values)
    ironManIntervalMinutes: { type: Number, default: 1, min: 0.5, max: 30 },
    thorIntervalMinutes: { type: Number, default: 2, min: 0.5, max: 30 },
    jetIntervalMinutes: { type: Number, default: 1, min: 0.5, max: 30 },
    starIntervalMinutes: { type: Number, default: 0.5, min: 0.1, max: 10 },

    // 3. QUANTUM VOLUME DENSITY CONFIGURATORS (Counters / Scaling Multipliers)
    jetSpawnCount: { type: Number, default: 1, min: 1, max: 5 },
    starSpawnCount: { type: Number, default: 2, min: 1, max: 10 },
    fireworksParticleDensity: { type: Number, default: 65, min: 20, max: 200 },
    fireworksClickProbability: { type: Number, default: 0.08, min: 0, max: 1 },

    // 4. ANIMATION TRAJECTORY SPEED CALIBRATIONS (Lower is faster velocity tracking)
    ironManFlightDuration: { type: Number, default: 2.6, min: 0.5, max: 15 },
    thorStrikeDuration: { type: Number, default: 1.5, min: 0.4, max: 10 },
    jetFlightDuration: { type: Number, default: 4.2, min: 0.5, max: 15 }, // NEW: Adjustable speed variable map for scifi jets
    shootingStarDuration: { type: Number, default: 1.2, min: 0.2, max: 6 },

    // 5. PER-PAGE INDEPENDENT INTERFACE GRAPH MAP CONFIGURATIONS
    pageScopes: {
        home: { type: pageConfigSchema, default: () => ({}) },
        projects: { type: pageConfigSchema, default: () => ({}) },
        certifications: { type: pageConfigSchema, default: () => ({}) },
        about: { type: pageConfigSchema, default: () => ({}) },
        contact: { type: pageConfigSchema, default: () => ({}) }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);