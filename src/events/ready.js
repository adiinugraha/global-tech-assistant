const { Events, ActivityType } = require('discord.js');
const logger = require('../utils/logger');
const { BOT_NAME } = require('../config/constants');
const { startReminderScheduler } = require('../services/reminderService');
const { startRssScheduler } = require('../services/rssService');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`✨ ${BOT_NAME} is online and logged in as ${client.user.tag}!`);
    logger.info(`Connected to ${client.guilds.cache.size} servers serving ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users.`);

    // Set dynamic rich presence
    client.user.setPresence({
      activities: [{
        name: 'Network Intelligence | /help',
        type: ActivityType.Watching
      }],
      status: 'online'
    });

    // Start background services
    startReminderScheduler(client);
    startRssScheduler(client);
  }
};
