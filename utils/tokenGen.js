// utils/tokenGen.js
const crypto = require('crypto');

// Store tokens in memory (in production, use a database)
// Format: { token: userId }
const tokenStore = {};

/**
 * Generate a token for a user
 * @param {string} userId - The Discord user ID
 * @returns {string} - The generated token
 */
function generateToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    tokenStore[token] = {
        userId: userId,
        createdAt: Date.now(),
        expiresAt: Date.now() + (3 * 60 * 60 * 1000) // 3 hours expiration
    };
    return token;
}

/**
 * Validate a token and get the associated userId
 * @param {string} token - The token to validate
 * @returns {string|null} - The userId if valid, null otherwise
 */
function validateToken(token) {
    if (!tokenStore[token]) {
        return null;
    }

    const tokenData = tokenStore[token];

    // Check if token has expired
    if (Date.now() > tokenData.expiresAt) {
        delete tokenStore[token];
        return null;
    }

    return tokenData.userId;
}

/**
 * Revoke a token
 * @param {string} token - The token to revoke
 */
function revokeToken(token) {
    delete tokenStore[token];
}

function validateTokenBoolState(token) {
    return validateToken(token) !== null;
}

module.exports = {
    generateToken,
    validateToken,
    revokeToken,
    validateTokenBoolState
};
