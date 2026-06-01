/**
 * FILE DETAILS: Studio Editor Core Server Entry Point
 * --------------------------------------------------
 * This file serves as the main engine for the administrative studio backend. It handles:
 * 1. Environment Configurations: Loads secrets (like the Coolify MONGO_URI) via dotenv.
 * 2. Database Pooling: Connects asynchronously to the shared cloud MongoDB cluster.
 * 3. Session Security: Installs express-session to track active WebAuthn challenges.
 * 4. Rendering Architecture: Configures EJS as the template view delivery engine.
 * 5. Input Processing: Sets up URL-encoded and JSON body-parsers to process administrative form submissions.
 * 6. Assets pipeline: Serves custom studio static stylesheets, scripts, and visual aids out of 'public/'.
 * 7. Administrative Routes: Mounts your absolute CRUD route mapping layers and WebAuthn authenticators.
 * 8. Server Initialization: Binds execution to port 3001 to prevent conflicts with the main frontend instance.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session'); // ADDED: Required for Passkey memory arrays

const app = express();
// Defaulting to 3001 to run side-by-side with your main portfolio on port 3000
const port = process.env.PORT || 3001; 

// ==========================================
// 1. DATABASE CONNECTIVITY LAYER
// ==========================================
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error('CRITICAL ERROR: "MONGO_URI" is undefined inside your editor .env file.');
    process.exit(1);
}

// Establish an active connection pool to your Coolify cluster (Defaulting to portfolio_editor namespace)
mongoose.connect(mongoUri)
    .then(() => {
        console.log('✅ Studio System successfully synchronized with the Coolify MongoDB instance.');
    })
    .catch((err) => {
        console.error('❌ Studio Database connection pool error:', err.message);
        process.exit(1);
    });

// ==========================================
// 2. VIEW ENGINE & MIDDLEWARE PIPELINE
// ==========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Essential for handling client-side AJAX JSON data sorting sequences

// ADDED: State tracking middleware for temporary cryptographic handshakes
app.use(session({
    secret: 'dwivedi_studio_enclave_key_2026', // Fallback secure string
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 60 * 60 * 1000, // 1 hour session allocation expiration
        secure: false // Set to true if running over HTTPS directly without a proxy setup
    }
}));

// Global variables injection pipeline (Modified to pass user profile tracking states and Coolify toggles)
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.authMode = process.env.AUTH_MODE || 'HYBRID'; // Exposes your Coolify toggle flag right to EJS windows
    res.locals.user = req.session.user || null; // Makes the logged-in session accessible to your layouts
    next();
});

// ==========================================
// 3. ROUTE MOUNTING & ERROR FALLBACKS
// ==========================================
const authRoutes = require('./routes/authRoutes');
const editorRoutes = require('./routes/editorRoutes');

app.use('/auth', authRoutes); // ADDED: Mounts your challenge/verification routes under /auth
app.use('/', editorRoutes);

// Fallback 404 handler for invalid studio routes
app.use((req, res) => {
    res.status(404).send('Studio Resource Not Found');
});

// ==========================================
// 4. SERVER RUNTIME INITIALIZATION
// ==========================================
app.listen(port, () => {
    console.log(`🚀 Studio Editor is active on http://localhost:${port}`);
});