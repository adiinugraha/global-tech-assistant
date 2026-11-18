const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Mengunci kanal dari pengiriman pesan')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan penguncian kanal')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin.')], ephemeral: true });
    }

    const reason = interaction.options.getString('alasan') || 'Kanal dikunci oleh moderator';

    try {
      await modService.lockChannel(interaction.channel, reason);
      return interaction.reply({
        embeds: [embeds.warning('🔒 Kanal Dikunci', `Kanal ini telah dikunci untuk umum.\n**Alasan:** ${reason}`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal Mengunci Kanal', err.message)], ephemeral: true });
    }
  }
};
