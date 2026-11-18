/**
 * Event Loader & Binder
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  if (!fs.existsSync(eventsPath)) return;

  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of eventFiles) {
    try {
      const event = require(path.join(eventsPath, file));
      if (event.name && event.execute) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        logger.debug(`Registered event: ${event.name}`);
      }
    } catch (err) {
      logger.error(`Error loading event ${file}:`, err);
    }
  }

  logger.info(`Successfully registered ${eventFiles.length} Discord gateway events.`);
}

module.exports = { loadEvents };
