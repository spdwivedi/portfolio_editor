/**
 * FILE DETAILS: Studio Cryptographic Authentication & User Management Router
 * -------------------------------------------------------------------------
 * Handles standard credentials, dynamic signup gates, WebAuthn handshakes, 
 * and full administrative management of registered user profiles and hardware keys.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const RP_ID = process.env.RP_ID || 'localhost'; 
const ORIGIN = process.env.ORIGIN || 'http://localhost:3001'; 

// Middleware to protect internal User Management API endpoints
const isAdmin = (req, res, next) => {
    if (req.session && req.session.user) return next();
    res.status(401).json({ error: 'Unauthorized access to security registry context.' });
};

// ------------------------------------------
// ROUTE: Render Security Gate
// ------------------------------------------
router.get('/login', (req, res) => {
    // Expose registration toggle logic dynamically to the login template window
    res.render('editor/login', { 
        allowRegistration: process.env.ALLOW_REGISTRATION === 'true' 
    });
});

// ------------------------------------------
// ROUTE: Public Registration Ingestion Point
// ------------------------------------------
router.post('/register-public', async (req, res) => {
    if (process.env.ALLOW_REGISTRATION !== 'true') {
        return res.status(403).json({ error: 'Registration channel is currently closed by configuration logs.' });
    }

    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing required credentials fields.' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'An administrator account already matches this email address.' });

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({ email, passwordHash, passkeys: [] });
        await newUser.save();

        res.status(201).json({ success: true, message: 'Administrative profile initialized successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------------------
// ROUTE: Traditional Password Channel
// ------------------------------------------
router.post('/login-password', async (req, res) => {
    if (process.env.AUTH_MODE === 'PASSKEY_ONLY') {
        return res.status(403).json({ error: 'Security Enforcement: Password channel is locked out.' });
    }

    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send('Missing credential payloads.');

        const userCount = await User.countDocuments();

        // AUTONOMIC PROVISIONER: Automatically hooks up your first account if the database is blank
        if (userCount === 0) {
            console.log(`⚠️ No admin profiles detected. Provisioning primary node: ${email}`);
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(password, salt);
            const masterUser = new User({ email, passwordHash, passkeys: [] });
            await masterUser.save();
        }

        const user = await User.findOne({ email });
        if (user && user.passwordHash) {
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (isMatch) {
                req.session.user = { id: user._id, email: user.email };
                return res.redirect('/');
            }
        }

        res.status(401).send('Authentication parameter mismatched.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal system authorization engine error.');
    }
});

// ==========================================
// PASSKEY DEVICE REGISTRATION PIPELINE
// ==========================================

router.post('/register-challenge', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Session context missing.' });
    }

    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).json({ error: 'User record context invalid.' });

        const options = await generateRegistrationOptions({
            rpName: 'Dwivedi AI Editor Studio',
            rpID: RP_ID,
            userID: Buffer.from(user._id.toString()),
            userName: user.email,
            userDisplayName: user.email.split('@')[0],
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred'
            },
            // FIXED: Removed the Buffer.from wrapper to prevent input.replace engine crashes
            excludeCredentials: user.passkeys.map(p => ({
                id: p.credentialID, 
                type: 'public-key'
            }))
        });

        req.session.currentChallenge = options.challenge;
        res.json(options);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/register-verify', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.currentChallenge) {
        return res.status(401).json({ error: 'Invalid tracking state.' });
    }

    try {
        const user = await User.findById(req.session.user.id);
        const expectedChallenge = req.session.currentChallenge;
        req.session.currentChallenge = null;

        const verification = await verifyRegistrationResponse({
            response: req.body,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            requireUserVerification: false
        });

        if (verification.verified) {
            const { registrationInfo } = verification;
            const { credential } = registrationInfo;
            
            user.passkeys.push({
                credentialID: credential.id,
                publicKey: Buffer.from(credential.publicKey).toString('base64url'),
                counter: credential.counter,
                transports: credential.transports || []
            });

            await user.save();
            return res.json({ verified: true });
        }

        res.status(400).json({ error: 'Registration verification validation failed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PASSKEY PASSWORDLESS LOGIN PIPELINE
// ==========================================

router.post('/login-challenge', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Identity email required.' });

        const user = await User.findOne({ email });
        if (!user || user.passkeys.length === 0) {
            return res.status(400).json({ error: 'No trusted passkeys linked to this profile address.' });
        }

        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            allowCredentials: user.passkeys.map(p => ({
                id: p.credentialID,
                type: 'public-key',
                transports: p.transports
            })),
            userVerification: 'preferred'
        });

        req.session.currentChallenge = options.challenge;
        req.session.loginEmail = user.email;

        res.json(options);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/login-verify', async (req, res) => {
    if (!req.session || !req.session.currentChallenge || !req.session.loginEmail) {
        return res.status(401).json({ error: 'Transaction context timeout.' });
    }

    try {
        const user = await User.findOne({ email: req.session.loginEmail });
        const expectedChallenge = req.session.currentChallenge;
        
        req.session.currentChallenge = null;
        req.session.loginEmail = null;

        const { authResponse } = req.body;
        const dbPasskey = user.passkeys.find(p => p.credentialID === authResponse.id);
        if (!dbPasskey) return res.status(400).json({ error: 'Hardware signature token mismatched.' });

        const verification = await verifyAuthenticationResponse({
            response: authResponse,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: dbPasskey.credentialID,
                publicKey: Buffer.from(dbPasskey.publicKey, 'base64url'),
                counter: dbPasskey.counter,
                transports: dbPasskey.transports
            },
            requireUserVerification: false
        });

        if (verification.verified) {
            dbPasskey.counter = verification.authenticationInfo.newCounter;
            await user.save();

            req.session.user = { id: user._id, email: user.email };
            return res.json({ verified: true });
        }

        res.status(401).json({ error: 'Signature handshake verification failed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMINISTRATIVE USER REGISTRY MANAGEMENT API
// ==========================================

// Fetch all registered administrative profiles
router.get('/users', isAdmin, async (req, res) => {
    try {
        // Exclude password hashes from traveling across network response streams
        const profiles = await User.find({}, '-passwordHash').sort({ createdAt: 1 });
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an administrator account entirely
router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        // Prevent an administrator from deleting their own session
        if (req.session.user.id === req.params.id) {
            return res.status(400).json({ error: 'Self-destruction safety block: You cannot delete your own active session.' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Account extracted from security registries.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Revoke a specific passkey hardware device key signature token from a user's array
router.delete('/users/:userId/passkeys/:credentialId', isAdmin, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) return res.status(404).json({ error: 'Target profile identity reference missing.' });

        // Filter out the revoked device out of the user's schema matrix
        targetUser.passkeys = targetUser.passkeys.filter(k => k.credentialID !== req.params.credentialId);
        await targetUser.save();

        res.json({ success: true, message: 'Hardware device key credentials signature revoked successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------------------------------
// ROUTE: Terminate Authentication Session
// ------------------------------------------
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;