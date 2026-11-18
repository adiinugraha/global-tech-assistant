const { Events } = require('discord.js');
const welcomeService = require('../modules/welcome/welcomeService');
const auditLogger = require('../modules/logging/auditLogger');
const embeds = require('../utils/embeds');
const { COLORS } = require('../config/constants');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    // 1. Goodbye Announcement
    await welcomeService.handleMemberRemove(member);

    // 2. Audit Log
    const logEmbed = embeds.auditLog({
      title: 'Anggota Meninggalkan Server',
      description: `<@${member.id}> (\`${member.user?.tag || member.displayName}\`) telah meninggalkan server.`,
      color: COLORS.DARK,
      fields: [
        { name: 'Sisa Anggota', value: `${member.guild.memberCount}`, inline: true }
      ]
    });
    await auditLogger.sendLog(member.guild, logEmbed);
  }
};
