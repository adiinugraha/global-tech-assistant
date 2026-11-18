const { Events } = require('discord.js');
const auditLogger = require('../modules/logging/auditLogger');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    await auditLogger.logMessageUpdate(oldMessage, newMessage);
  }
};
