const { SlashCommandBuilder } = require('discord.js');
const levelingService = require('../../modules/leveling/levelingService');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Melihat level, XP, dan peringkat aktivitas Anda atau anggota lain')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Pilih anggota (kosongkan untuk melihat profil Anda)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const rankData = levelingService.getUserRank(interaction.guildId, user.id);

    if (!rankData) {
      return interaction.reply({
        embeds: [embeds.info('Belum Memiliki XP', `${user.id === interaction.user.id ? 'Anda' : user.username} belum memiliki catatan aktivitas atau pesan di server ini.`)],
        ephemeral: true
      });
    }

    // Progress bar visualization
    const progressRatio = Math.min(1, Math.max(0, rankData.currentProgressXp / rankData.neededForNext));
    const totalBars = 10;
    const filledBars = Math.round(progressRatio * totalBars);
    const progressBar = '🟩'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    const embed = embeds.base(`📊 Kartu Peringkat: ${user.tag}`, null)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🏆 Peringkat', value: `#${rankData.rank}`, inline: true },
        { name: '⭐ Level', value: `${rankData.level}`, inline: true },
        { name: '💬 Total Pesan', value: `${rankData.messages.toLocaleString()}`, inline: true },
        {
          name: `📈 Progress Level (${Math.floor(progressRatio * 100)}%)`,
          value: `${progressBar}\n**${rankData.currentProgressXp.toLocaleString()}** / **${rankData.neededForNext.toLocaleString()}** XP menuju Level ${rankData.level + 1}\n*(Total XP: ${rankData.xp.toLocaleString()})*`,
          inline: false
        }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
