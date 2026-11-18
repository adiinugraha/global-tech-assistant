const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Melihat riwayat peringatan seorang anggota')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang ingin diperiksa')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member) && interaction.options.getUser('target').id !== interaction.user.id) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya moderator yang dapat melihat riwayat orang lain.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    const warnings = modService.getWarnings(interaction.guildId, targetUser.id);

    if (warnings.length === 0) {
      return interaction.reply({
        embeds: [embeds.info('Riwayat Peringatan Bersih', `<@${targetUser.id}> tidak memiliki riwayat peringatan.`)]
      });
    }

    const fields = warnings.slice(0, 10).map((w, index) => ({
      name: `#${index + 1} • ${w.created_at}`,
      value: `**Alasan:** ${w.reason}\n**Moderator:** <@${w.moderator_id}>`,
      inline: false
    }));

    const embed = embeds.warning(
      `Riwayat Peringatan: ${targetUser.tag}`,
      `Total peringatan: **${warnings.length}**`
    ).addFields(fields);

    return interaction.reply({ embeds: [embed] });
  }
};
