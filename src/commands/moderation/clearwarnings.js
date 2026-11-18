const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-warnings')
    .setDescription('Menghapus seluruh riwayat peringatan anggota')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang riwayatnya ingin dibersihkan')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat menghapus riwayat peringatan.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    modService.clearWarnings(interaction.guildId, targetUser.id);

    return interaction.reply({
      embeds: [embeds.success('Peringatan Dihapus', `Seluruh riwayat peringatan untuk <@${targetUser.id}> telah dibersihkan.`)]
    });
  }
};
