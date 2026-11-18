/**
 * Global Tech Assistant (GTA) - Main Entry Point
 */

require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials
} = require('discord.js');

const logger = require('./utils/logger');
const db = require('./database');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

const token = process.env.DISCORD_TOKEN;

// Initialize SQLite database
db.initDatabase();

// Instantiate Discord Client with required Intents and Partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Privileged Intent
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Privileged Intent
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

// Load Slash Commands and Gateway Events
loadCommands(client);
loadEvents(client);

// Centralized Global Error Handlers (Reliability & Resilience)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection detected:', reason);
});

process.on('uncaughtException', (err, origin) => {
  logger.error(`Uncaught Exception (${origin}):`, err);
});

// Graceful Shutdown
function handleShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down Global Tech Assistant gracefully...`);
  try {
    client.destroy();
  } catch (e) {
    // ignore
  }
  process.exit(0);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Connect to Discord Gateway
if (!token) {
  logger.warn('DISCORD_TOKEN is not defined in environment variables or .env file!');
} else {
  client.login(token).catch(err => {
    logger.error('Failed to log in to Discord Gateway:', err.message);
  });
}

// HTTP handler for Vercel Serverless / Healthcheck API
module.exports = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    bot: 'Global Tech Assistant (GTA)',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  }));
};
