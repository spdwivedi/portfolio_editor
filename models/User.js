const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String }, // Used during fallback/hybrid configurations
  currentChallenge: { type: String }, // Temporary holder for WebAuthn session tracking
  passkeys: [{
    credentialID: { type: String, required: true },
    publicKey: { type: String, required: true }, // Saved as base64url string
    counter: { type: Number, default: 0 },
    transports: [String]
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);