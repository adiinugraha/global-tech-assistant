/**
 * Command Handler
 * Recursively registers Slash Commands from the commands directory.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadCommands(client) {
  client.commands = new Map();
  const commandsPath = path.join(__dirname, '../commands');

  if (!fs.existsSync(commandsPath)) {
    logger.warn('Commands directory does not exist.');
    return;
  }

  function readDirRecursive(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        readDirRecursive(fullPath);
      } else if (file.endsWith('.js')) {
        try {
          const command = require(fullPath);
          if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            logger.debug(`Loaded command: /${command.data.name}`);
          } else {
            logger.warn(`File ${file} is missing required data or execute export.`);
          }
        } catch (err) {
          logger.error(`Error loading command file ${file}:`, err);
        }
      }
    }
  }

  readDirRecursive(commandsPath);
  logger.info(`Successfully loaded ${client.commands.size} Slash Commands.`);
}

module.exports = { loadCommands };
