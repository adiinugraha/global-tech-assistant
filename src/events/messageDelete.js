const { Events } = require('discord.js');
const auditLogger = require('../modules/logging/auditLogger');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    await auditLogger.logMessageDelete(message);
  }
};
