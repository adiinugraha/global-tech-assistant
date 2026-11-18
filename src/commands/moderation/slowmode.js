const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Mengatur jeda pengiriman pesan (slowmode) pada kanal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(opt =>
      opt.setName('detik')
        .setDescription('Jeda dalam detik (0 untuk mematikan slowmode, maks 21600)')
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin.')], ephemeral: true });
    }

    const seconds = interaction.options.getInteger('detik');

    try {
      await interaction.channel.setRateLimitPerUser(seconds);
      if (seconds === 0) {
        return interaction.reply({
          embeds: [embeds.success('Slowmode Dimatikan', 'Slowmode pada kanal ini telah dinonaktifkan.')]
        });
      } else {
        return interaction.reply({
          embeds: [embeds.success('Slowmode Diaktifkan', `Slowmode di kanal ini diatur ke **${seconds} detik** per pesan.`)]
        });
      }
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal Mengatur Slowmode', err.message)], ephemeral: true });
    }
  }
};
