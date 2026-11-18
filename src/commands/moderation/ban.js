const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator, canModerateTarget } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Memblokir anggota dari server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang akan diban')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan ban')
        .setRequired(false)
    )
    .addIntegerOption(opt =>
      opt.setName('hapus_pesan_hari')
        .setDescription('Hapus riwayat pesan target (0 - 7 hari)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin ban.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan yang diberikan';
    const deleteDays = interaction.options.getInteger('hapus_pesan_hari') || 0;

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (targetMember) {
      const check = canModerateTarget(interaction.member, targetMember);
      if (!check.can) {
        return interaction.reply({ embeds: [embeds.error('Hierarki Role', check.reason)], ephemeral: true });
      }
    }

    try {
      await modService.ban(interaction.guild, targetUser.id, interaction.user, reason, deleteDays);
      return interaction.reply({
        embeds: [embeds.success('Anggota Diblokir (Ban)', `Pengguna <@${targetUser.id}> (\`${targetUser.id}\`) telah diban dari server.\n**Alasan:** ${reason}`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal Ban', err.message)], ephemeral: true });
    }
  }
};
