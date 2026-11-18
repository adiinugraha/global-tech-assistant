const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isModerator, canModerateTarget } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Mengubah nama panggilan (nickname) anggota')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang ingin diubah nick-nya')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('nickname_baru')
        .setDescription('Nickname baru (kosongkan untuk mereset)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    const newNick = interaction.options.getString('nickname_baru');
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.reply({ embeds: [embeds.error('Gagal', 'Anggota tidak ditemukan.')], ephemeral: true });
    }

    const check = canModerateTarget(interaction.member, targetMember);
    if (!check.can) {
      return interaction.reply({ embeds: [embeds.error('Hierarki Role', check.reason)], ephemeral: true });
    }

    try {
      await targetMember.setNickname(newNick || null);
      return interaction.reply({
        embeds: [embeds.success('Nickname Diperbarui', `Nickname <@${targetUser.id}> berhasil diubah menjadi: **${newNick || targetUser.username}**`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal Mengubah Nickname', err.message)], ephemeral: true });
    }
  }
};
