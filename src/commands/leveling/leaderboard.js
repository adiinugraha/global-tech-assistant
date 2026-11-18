const { SlashCommandBuilder } = require('discord.js');
const levelingService = require('../../modules/leveling/levelingService');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Melihat papan peringkat 10 anggota teratas dengan XP tertinggi'),

  async execute(interaction) {
    const topMembers = levelingService.getLeaderboard(interaction.guildId, 10);

    if (topMembers.length === 0) {
      return interaction.reply({
        embeds: [embeds.info('Papan Peringkat Kosong', 'Belum ada anggota yang memperoleh XP di server ini.')]
      });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const lines = topMembers.map((m, idx) => {
      const medal = medals[idx] || `\`#${idx + 1}\``;
      return `${medal} <@${m.user_id}> ➔ **Level ${m.level}** (${m.xp.toLocaleString()} XP) • ${m.messages_count.toLocaleString()} pesan`;
    });

    const embed = embeds.base(
      `🏆 Papan Peringkat Komunitas: ${interaction.guild.name}`,
      lines.join('\n\n')
    );

    return interaction.reply({ embeds: [embed] });
  }
};
