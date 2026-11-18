const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator, canModerateTarget } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Memberikan peringatan kepada anggota')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang akan diberi peringatan')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan pemberian peringatan')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin moderator.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('alasan');
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.reply({ embeds: [embeds.error('Gagal', 'Anggota tidak ditemukan di server.')], ephemeral: true });
    }

    const check = canModerateTarget(interaction.member, targetMember);
    if (!check.can) {
      return interaction.reply({ embeds: [embeds.error('Hierarki Role', check.reason)], ephemeral: true });
    }

    await modService.warn(interaction.guild, targetMember, interaction.user, reason);

    return interaction.reply({
      embeds: [embeds.success('Peringatan Diberikan', `Berhasil memberikan peringatan kepada <@${targetUser.id}>.\n**Alasan:** ${reason}`)]
    });
  }
};
