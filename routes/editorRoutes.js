/**
 * FILE DETAILS: Advanced Studio Editor Routing Engine & Data Management System
 * -------------------------------------------------------------------------
 * This file orchestrates all data transformations across your cloud cluster.
 * Upgraded with session security barriers and multi-database routing layers.
 * * 1. GATEKEEPER MIDDLEWARE: Validates administrative session tokens prior to resolving endpoints.
 * 2. DATABASE CROSS-ROUTING: Utilizes useDb() to target the live portfolio data space seamlessly.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ==========================================
// 1. SESSION AUTHENTICATION GUARD (MIDDLEWARE)
// ==========================================
const isAuthenticated = (req, res, next) => {
    // If the session exists and a valid user object is attached, let them through
    if (req.session && req.session.user) {
        return next();
    }
    // Otherwise, block the request and send them back to the login gateway
    res.redirect('/auth/login');
};

// Apply the security guard to ALL routes within this engine file
router.use(isAuthenticated);

// ==========================================
// 2. MULTI-DATABASE CROSS-ROUTING SCHEME
// ==========================================
// Explicitly shift the database context pointer to target your portfolio data grid
const portfolioDb = mongoose.connection.useDb('portfolio_db');

// Extract the schemas from your models and compile them against the live portfolio database context
const Project = portfolioDb.model('Project', require('../models/Project').schema);
const Certificate = portfolioDb.model('Certificate', require('../models/Certificate').schema);
const ActivityLog = portfolioDb.model('ActivityLog', require('../models/ActivityLog').schema);
const Setting = portfolioDb.model('Setting', require('../models/Setting').schema);

// ==========================================
// 3. DASHBOARD FRAMEWORK DISPATCHER
// ==========================================
router.get('/', async (req, res) => {
    try {
        const activeProjects = await Project.find({ isDeleted: { $ne: true } }).sort({ 'layout.orderIndex': 1 });
        const recycledProjects = await Project.find({ isDeleted: true }).sort({ updatedAt: -1 });
        const certificates = await Certificate.find().sort({ year: -1 });
        const auditHistory = await ActivityLog.find().sort({ createdAt: -1 }).limit(15);

        // AUTONOMIC STATE CHECKER: Fetches or creates deep nested setting blueprints
        let operationalSettings = await Setting.findOne();
        if (!operationalSettings) {
            operationalSettings = new Setting({});
            await operationalSettings.save();
        }

        res.render('editor/dashboard', {
            title: 'Studio Dashboard',
            projects: activeProjects,
            recycledProjects: recycledProjects,
            certificates: certificates,
            logs: auditHistory,
            settings: operationalSettings
        });
    } catch (err) {
        console.error('Critical operational crash encountered loading studio dashboard metadata:', err);
        res.status(500).send('Administrative workspace initialization engine failed.');
    }
});

// ==========================================
// 4. LIVE GLOBAL & PER-PAGE SETTINGS CONTROL PIPELINE
// ==========================================
router.post('/settings', async (req, res) => {
    try {
        // Extract incoming form variables out of multi-layered client requests
        const {
            vfxEngineActive,
            systemExecutionMode,
            ironManIntervalMinutes,
            thorIntervalMinutes,
            jetIntervalMinutes,
            starIntervalMinutes,
            jetSpawnCount,
            starSpawnCount,
            fireworksParticleDensity,
            fireworksClickProbability,
            ironManFlightDuration,
            thorStrikeDuration,
            jetFlightDuration,
            shootingStarDuration,
            
            // Per-Page Scopes Mapping Ingestion Elements
            home_mario, home_ironman, home_thor, home_jets, home_stars, home_fireworks,
            projects_mario, projects_ironman, projects_thor, projects_jets, projects_stars, projects_fireworks,
            certs_mario, certs_ironman, certs_thor, certs_jets, certs_stars, certs_fireworks,
            about_mario, about_ironman, about_thor, about_jets, about_stars, about_fireworks,
            contact_mario, contact_ironman, contact_thor, contact_jets, contact_stars, contact_fireworks
        } = req.body;

        // Build the updated schema payload structure matching nested rules
        const updatePayload = {
            vfxEngineActive: vfxEngineActive === 'true',
            systemExecutionMode: systemExecutionMode || 'ambient',
            
            // Numeric Schedulers & Particle Density Allocations
            ironManIntervalMinutes: parseFloat(ironManIntervalMinutes) || 1,
            thorIntervalMinutes: parseFloat(thorIntervalMinutes) || 2,
            jetIntervalMinutes: parseFloat(jetIntervalMinutes) || 1,
            starIntervalMinutes: parseFloat(starIntervalMinutes) || 0.5,
            
            jetSpawnCount: parseInt(jetSpawnCount) || 1,
            starSpawnCount: parseInt(starSpawnCount) || 2,
            fireworksParticleDensity: parseInt(fireworksParticleDensity) || 65,
            fireworksClickProbability: parseFloat(fireworksClickProbability) || 0.08,
            
            // Flight & Physics Durations
            ironManFlightDuration: parseFloat(ironManFlightDuration) || 2.6,
            thorStrikeDuration: parseFloat(thorStrikeDuration) || 1.5,
            jetFlightDuration: parseFloat(jetFlightDuration) || 4.2,
            shootingStarDuration: parseFloat(shootingStarDuration) || 1.2,

            // Build Per-Page Structured Deep Context Maps
            pageScopes: {
                home: {
                    marioEnabled: home_mario === 'true',
                    ironManEnabled: home_ironman === 'true',
                    thorEnabled: home_thor === 'true',
                    jetsEnabled: home_jets === 'true',
                    starsEnabled: home_stars === 'true',
                    fireworksEnabled: home_fireworks === 'true'
                },
                projects: {
                    marioEnabled: projects_mario === 'true',
                    ironManEnabled: projects_ironman === 'true',
                    thorEnabled: projects_thor === 'true',
                    jetsEnabled: projects_jets === 'true',
                    starsEnabled: projects_stars === 'true',
                    fireworksEnabled: projects_fireworks === 'true'
                },
                certifications: {
                    marioEnabled: certs_mario === 'true',
                    ironManEnabled: certs_ironman === 'true',
                    thorEnabled: certs_thor === 'true',
                    jetsEnabled: certs_jets === 'true',
                    starsEnabled: certs_stars === 'true',
                    fireworksEnabled: certs_fireworks === 'true'
                },
                about: {
                    marioEnabled: about_mario === 'true',
                    ironManEnabled: about_ironman === 'true',
                    thorEnabled: about_thor === 'true',
                    jetsEnabled: about_jets === 'true',
                    starsEnabled: about_stars === 'true',
                    fireworksEnabled: about_fireworks === 'true'
                },
                contact: {
                    marioEnabled: contact_mario === 'true',
                    ironManEnabled: contact_ironman === 'true',
                    thorEnabled: contact_thor === 'true',
                    jetsEnabled: contact_jets === 'true',
                    starsEnabled: contact_stars === 'true',
                    fireworksEnabled: contact_fireworks === 'true'
                }
            }
        };

        let currentSettings = await Setting.findOne();
        if (!currentSettings) {
            currentSettings = new Setting(updatePayload);
            await currentSettings.save();
        } else {
            await Setting.findByIdAndUpdate(currentSettings._id, updatePayload);
        }

        const configurationLog = new ActivityLog({
            actionType: 'UPDATE',
            targetType: 'Project',
            targetId: currentSettings._id,
            description: `GLOBAL GRAPH INTERFACE TUNING: Updated execution tracks, minute loops, and multi-page visibility matrices.`,
            operator: req.session.user.email // Automatically tracks the logged-in administrator's email
        });
        await configurationLog.save();

        res.json({ success: true, message: "Highly granular engine maps synchronized successfully." });
    } catch (err) {
        console.error('Tuning dashboard write error context:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// 5. SMART BATCH DATA INGESTION ENGINE
// ==========================================
router.post('/:spaceType/batch', async (req, res) => {
    try {
        const { spaceType } = req.params;
        const { items, strategy } = req.body; 
        const currentOperator = req.session.user.email;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, error: 'Pasted payload must be a valid JSON array structure.' });
        }

        let processedCount = 0;
        let skippedCount = 0;

        if (spaceType === 'projects') {
            for (const item of items) {
                const duplicateRecord = await Project.findOne({ title: item.title, isDeleted: false });

                if (duplicateRecord) {
                    if (strategy === 'skip') {
                        skippedCount++;
                        continue;
                    } else if (strategy === 'overwrite') {
                        await Project.findByIdAndUpdate(duplicateRecord._id, {
                            category: item.category || duplicateRecord.category,
                            description: item.description || duplicateRecord.description,
                            tags: item.tags || duplicateRecord.tags,
                            links: {
                                github: item.github || duplicateRecord.links.github,
                                liveUrl: item.liveUrl || duplicateRecord.links.liveUrl,
                                datasetUrl: item.datasetUrl || duplicateRecord.links.datasetUrl
                            },
                            'layout.size': item.size || duplicateRecord.layout.size,
                            accentColor: item.accentColor || duplicateRecord.accentColor || '#00f2ea',
                            hoverAnimation: item.hoverAnimation || duplicateRecord.hoverAnimation || 'aura-glow'
                        });
                        processedCount++;
                        continue;
                    }
                }

                const totalProjects = await Project.countDocuments({ isDeleted: { $ne: true } });
                const newProject = new Project({
                    title: item.title,
                    category: item.category || 'Personal Projects',
                    description: item.description || 'Uploaded via bulk stream.',
                    tags: Array.isArray(item.tags) ? item.tags : (item.tags ? item.tags.split(',').map(t => t.trim()) : []),
                    links: { github: item.github || '', liveUrl: item.liveUrl || '', datasetUrl: item.datasetUrl || '' },
                    layout: { size: item.size || 'normal', orderIndex: totalProjects },
                    accentColor: item.accentColor || '#00f2ea',
                    hoverAnimation: item.hoverAnimation || 'aura-glow',
                    isDeleted: false
                });
                await newProject.save();
                processedCount++;
            }
        } else if (spaceType === 'certificates') {
            for (const item of items) {
                const duplicateCert = await Certificate.findOne({ title: item.title });

                if (duplicateCert) {
                    if (strategy === 'skip') {
                        skippedCount++;
                        continue;
                    } else if (strategy === 'overwrite') {
                        await Certificate.findByIdAndUpdate(duplicateCert._id, {
                            platform: item.platform || duplicateCert.platform,
                            year: parseInt(item.year) || duplicateCert.year,
                            verifyUrl: item.verifyUrl || duplicateCert.verifyUrl
                        });
                        processedCount++;
                        continue;
                    }
                }

                const newCert = new Certificate({
                    title: item.title,
                    platform: item.platform || 'Other',
                    year: parseInt(item.year) || new Date().getFullYear(),
                    verifyUrl: item.verifyUrl || ''
                });
                await newCert.save();
                processedCount++;
            }
        } else {
            return res.status(400).doc({ success: false, error: 'Unknown workspace data space context parameter.' });
        }

        const batchAuditRecord = new ActivityLog({
            actionType: 'CREATE',
            targetType: spaceType === 'projects' ? 'Project' : 'Certificate',
            targetId: new mongoose.Types.ObjectId(), 
            description: `BATCH STREAM: Ingested ${processedCount} entries into ${spaceType} using the '${strategy}' conflict path (Skipped: ${skippedCount}).`,
            operator: currentOperator
        });
        await batchAuditRecord.save();

        res.json({ success: true, processed: processedCount, skipped: skippedCount });
    } catch (err) {
        console.error('Batch integration execution fault:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// 6. SECURE SYSTEM DATA EXPORT BACKUP MODULES
// ==========================================
router.get('/:spaceType/export', async (req, res) => {
    try {
        const { spaceType } = req.params;
        let extractedDataData = [];

        if (spaceType === 'projects') {
            extractedDataData = await Project.find({ isDeleted: { $ne: true } }).sort({ 'layout.orderIndex': 1 });
        } else if (spaceType === 'certificates') {
            extractedDataData = await Certificate.find().sort({ year: -1 });
        } else {
            return res.status(400).send('Invalid data collection target context reference point.');
        }

        const fileTimestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=dwivedi_ai_${spaceType}_export_${fileTimestamp}.json`);
        
        res.send(JSON.stringify(extractedDataData, null, 4));
    } catch (err) {
        console.error('Data backup streaming exception:', err);
        res.status(500).send('Failed to compile data pipeline export packages streams.');
    }
});

// ==========================================
// 7. PROJECT SINGLE INSTANCE CREATION CORE
// ==========================================
router.post('/projects', async (req, res) => {
    try {
        const { title, category, description, tags, github, liveUrl, datasetUrl, size, accentColor, hoverAnimation } = req.body;
        const totalProjects = await Project.countDocuments({ isDeleted: { $ne: true } });

        const newProject = new Project({
            title,
            category,
            description,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            links: { github, liveUrl, datasetUrl },
            layout: { size, orderIndex: totalProjects },
            accentColor: accentColor || '#00f2ea',
            hoverAnimation: hoverAnimation || 'aura-glow',
            isDeleted: false
        });

        const savedProject = await newProject.save();

        const auditRecord = new ActivityLog({
            actionType: 'CREATE',
            targetType: 'Project',
            targetId: savedProject._id,
            description: `Successfully published new project node: "${title}" into the ${category} track.`,
            operator: req.session.user.email
        });
        await auditRecord.save();

        res.status(201).json({ success: true, message: 'Engineering record synchronized successfully.' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ==========================================
// 8. COMPONENT MODIFICATION CORE (UPDATE)
// ==========================================
router.put('/projects/:id', async (req, res) => {
    try {
        const { title, category, description, tags, github, liveUrl, datasetUrl, size, accentColor, hoverAnimation } = req.body;
        
        const updatedData = {
            title,
            category,
            description,
            tags: Array.isArray(tags) ? tags : tags?.split(',').map(t => t.trim()),
            links: { github, liveUrl, datasetUrl },
            'layout.size': size,
            accentColor: accentColor || '#00f2ea',
            hoverAnimation: hoverAnimation || 'aura-glow'
        };

        const resultNode = await Project.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!resultNode) return res.status(404).json({ success: false, error: 'Target collection asset identity missing.' });

        const changeLog = new ActivityLog({
            actionType: 'UPDATE',
            targetType: 'Project',
            targetId: resultNode._id,
            description: `Modified project configuration and field mappings for "${title}".`,
            operator: req.session.user.email
        });
        await changeLog.save();

        res.json({ success: true, message: 'Cloud documents parsed and shifted.' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ==========================================
// 9. RECYCLE BIN PIPELINE MECHANICS (SOFT-DELETE)
// ==========================================
router.patch('/projects/:id/delete', async (req, res) => {
    try {
        const softDeletedNode = await Project.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!softDeletedNode) return res.status(404).json({ success: false, error: 'Component match lookup failed.' });

        const deleteLog = new ActivityLog({
            actionType: 'SOFT_DELETE',
            targetType: 'Project',
            targetId: softDeletedNode._id,
            description: `Soft-deleted project "${softDeletedNode.title}" and relocated it to the Recycle Bin container.`,
            operator: req.session.user.email
        });
        await deleteLog.save();

        res.json({ success: true, message: 'Asset pulled from production grid and mapped into storage bin.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// 10. RESTORATION ENGINE MECHANICAL PIPELINE (UNDO SOFT-DELETE)
// ==========================================
router.patch('/projects/:id/restore', async (req, res) => {
    try {
        const restoredNode = await Project.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
        if (!restoredNode) return res.status(404).json({ success: false, error: 'Component validation failure.' });

        const restoreLog = new ActivityLog({
            actionType: 'RESTORE',
            targetType: 'Project',
            targetId: restoredNode._id,
            description: `Recovered and restored project "${restoredNode.title}" back to the active production grid matrix.`,
            operator: req.session.user.email
        });
        await restoreLog.save();

        res.json({ success: true, message: 'Component status flagged active. Public rendering operational.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// 11. HARD PURGE DATA MECHANICS (PERMANENT TERMINAL WIPE)
// ==========================================
router.delete('/projects/:id/permanent', async (req, res) => {
    try {
        const targetNode = await Project.findById(req.params.id);
        if (!targetNode) return res.status(404).json({ success: false, error: 'Target document component not found.' });

        await Project.findByIdAndDelete(req.params.id);

        const hardPurgeLog = new ActivityLog({
            actionType: 'SOFT_DELETE',
            targetType: 'Project',
            targetId: req.params.id,
            description: `PERMANENT WIPE: Erased node "${targetNode.title}" completely from database cluster storage.`,
            operator: req.session.user.email
        });
        await hardPurgeLog.save();

        res.json({ success: true, message: 'Document permanently extracted from cloud cluster infrastructure.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// 12. ASYMMETRIC SORT ALIGNMENT TRACKER (REORDER)
// ==========================================
router.post('/projects/reorder', async (req, res) => {
    try {
        const { sequenceArray } = req.body;
        
        const updatePromises = sequenceArray.map(item => 
            Project.findByIdAndUpdate(item.id, { 'layout.orderIndex': item.orderIndex })
        );
        await Promise.all(updatePromises);

        res.json({ success: true, message: 'Asymmetric matrix grid positioning array synchronized.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// 13. CERTIFICATE INGESTION MODULE (CREATE)
// ==========================================
router.post('/certificates', async (req, res) => {
    try {
        const { title, platform, year, verifyUrl } = req.body;

        const newCert = new Certificate({
            title,
            platform,
            year: parseInt(year) || new Date().getFullYear(),
            verifyUrl
        });

        const savedCert = await newCert.save();

        const auditRecord = new ActivityLog({
            actionType: 'CREATE',
            targetType: 'Certificate',
            targetId: savedCert._id,
            description: `Added certification milestone: "${title}" accomplished on platform ${platform}.`,
            operator: req.session.user.email
        });
        await auditRecord.save();

        res.status(201).json({ success: true, message: 'Certification milestone safely indexed.' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ==========================================
// 14. CERTIFICATE MODIFICATION MODULE (UPDATE)
// ==========================================
router.put('/certificates/:id', async (req, res) => {
    try {
        const { title, platform, year, verifyUrl } = req.body;
        
        const updatedData = {
            title,
            platform,
            year: parseInt(year),
            verifyUrl
        };

        const resultNode = await Certificate.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!resultNode) return res.status(404).json({ success: false, error: 'Target academic identity reference missing.' });

        const changeLog = new ActivityLog({
            actionType: 'UPDATE',
            targetType: 'Certificate',
            targetId: resultNode._id,
            description: `Recalibrated credential parameters and validation links for "${title}".`,
            operator: req.session.user.email
        });
        await changeLog.save();

        res.json({ success: true, message: 'Certificate instance properties overwritten.' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ==========================================
// 15. CERTIFICATE TERMINAL PURGE MODULE (DELETE)
// ==========================================
router.delete('/certificates/:id', async (req, res) => {
    try {
        const targetNode = await Certificate.findById(req.params.id);
        if (!targetNode) return res.status(404).json({ success: false, error: 'Target academic record missing.' });

        await Certificate.findByIdAndDelete(req.params.id);

        const purgeLog = new ActivityLog({
            actionType: 'SOFT_DELETE',
            targetType: 'Certificate',
            targetId: req.params.id,
            description: `Permanently deleted certification credential file: "${targetNode.title}" from index registries.`,
            operator: req.session.user.email
        });
        await purgeLog.save();

        res.json({ success: true, message: 'Certificate document wiped from collection space.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;