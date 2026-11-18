const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Membuka blokir pengguna dari server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(opt =>
      opt.setName('user_id')
        .setDescription('ID Discord pengguna yang ingin di-unban')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan unban')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin unban.')], ephemeral: true });
    }

    const userId = interaction.options.getString('user_id').trim();
    const reason = interaction.options.getString('alasan') || 'Unban oleh moderator';

    try {
      await modService.unban(interaction.guild, userId, interaction.user, reason);
      return interaction.reply({
        embeds: [embeds.success('Blokir Dibuka (Unban)', `Pengguna dengan ID \`${userId}\` telah berhasil dibuka blokirnya.\n**Alasan:** ${reason}`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal Unban', `Tidak dapat membuka blokir pengguna: ${err.message}`)], ephemeral: true });
    }
  }
};
