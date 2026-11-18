/**
 * Slash Command Registration Script
 * Deploys all commands in src/commands to Discord REST API.
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../src/utils/logger');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env file.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, '../src/commands');

function readCommandsRecursive(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readCommandsRecursive(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        commands.push(command.data.toJSON());
      }
    }
  }
}

readCommandsRecursive(commandsPath);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    logger.info(`Starting refresh of ${commands.length} application (/) commands...`);

    let data;
    if (guildId) {
      // Guild specific deployment (instant propagation, great for development)
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      logger.info(`Successfully reloaded ${data.length} application (/) commands for GUILD: ${guildId}`);
    } else {
      // Global deployment
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      logger.info(`Successfully reloaded ${data.length} application (/) commands GLOBALLY.`);
    }
  } catch (error) {
    logger.error('Failed to register application commands:', error);
  }
})();
