/**
 * Root Entry Point for Vercel and Node.js
 * Bridges root execution with src/index.js
 */

require('dotenv').config();

// Export the serverless HTTP handler and initialize the bot
module.exports = require('./src/index.js');
