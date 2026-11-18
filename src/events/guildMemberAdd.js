const { Events } = require('discord.js');
const welcomeService = require('../modules/welcome/welcomeService');
const automodService = require('../modules/automod/automodService');
const auditLogger = require('../modules/logging/auditLogger');
const embeds = require('../utils/embeds');
const { COLORS } = require('../config/constants');
const { discordTimestamp } = require('../utils/time');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // 1. Anti-Raid Inspection
    await automodService.handleMemberJoin(member);

    // 2. Welcome Message & Auto Role
    await welcomeService.handleMemberJoin(member);

    // 3. Audit Log
    const logEmbed = embeds.auditLog({
      title: 'Anggota Baru Bergabung',
      description: `<@${member.id}> (\`${member.user.tag}\`) telah bergabung ke server.`,
      color: COLORS.SUCCESS,
      fields: [
        { name: 'Usia Akun', value: discordTimestamp(member.user.createdAt, 'R'), inline: true },
        { name: 'Total Anggota', value: `${member.guild.memberCount}`, inline: true }
      ]
    });
    await auditLogger.sendLog(member.guild, logEmbed);
  }
};
