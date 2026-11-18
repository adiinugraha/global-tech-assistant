const { Events } = require('discord.js');
const auditLogger = require('../modules/logging/auditLogger');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    await auditLogger.logVoiceStateUpdate(oldState, newState);
  }
};
