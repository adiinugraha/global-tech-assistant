const { Events } = require('discord.js');
const auditLogger = require('../modules/logging/auditLogger');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    await auditLogger.logMemberUpdate(oldMember, newMember);
  }
};
