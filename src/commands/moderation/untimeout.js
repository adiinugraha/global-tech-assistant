const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Membatalkan batasan interaksi (Timeout) anggota')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang akan dibatalkan timeout-nya')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan pembatalan timeout')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin moderator.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('alasan') || 'Dibatalkan oleh moderator';
    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.reply({ embeds: [embeds.error('Gagal', 'Anggota tidak ditemukan.')], ephemeral: true });
    }

    try {
      await modService.untimeout(interaction.guild, targetMember, interaction.user, reason);
      return interaction.reply({
        embeds: [embeds.success('Timeout Dibatalkan', `Timeout untuk <@${targetUser.id}> telah dicabut.`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal', err.message)], ephemeral: true });
    }
  }
};
