const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Membuka kunci kanal agar anggota dapat mengirim pesan')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan pembukaan kunci')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin.')], ephemeral: true });
    }

    const reason = interaction.options.getString('alasan') || 'Kanal dibuka kembali oleh moderator';

    try {
      await modService.unlockChannel(interaction.channel, reason);
      return interaction.reply({
        embeds: [embeds.success('🔓 Kanal Dibuka', `Kanal ini telah dibuka kembali untuk pengiriman pesan.\n**Alasan:** ${reason}`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal Membuka Kanal', err.message)], ephemeral: true });
    }
  }
};
