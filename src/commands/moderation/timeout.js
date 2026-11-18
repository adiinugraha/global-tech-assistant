const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator } = require('../../utils/permissions');
const { parseDuration, formatHumanDuration } = require('../../utils/time');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Membatasi interaksi anggota (Timeout / Mute)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang akan di-timeout')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('durasi')
        .setDescription('Durasi timeout (contoh: 10m, 1h, 1d, maks 28d)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan timeout')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin moderator.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    const durationStr = interaction.options.getString('durasi');
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan yang diberikan';

    const durationMs = parseDuration(durationStr);
    if (!durationMs || durationMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({
        embeds: [embeds.error('Durasi Tidak Valid', 'Format durasi tidak valid atau melebihi batas maksimal Discord (28 hari). Contoh: `15m`, `2h`, `1d`.')],
        ephemeral: true
      });
    }

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({ embeds: [embeds.error('Gagal', 'Anggota tidak ditemukan di server.')], ephemeral: true });
    }

    try {
      await modService.timeout(interaction.guild, targetMember, interaction.user, durationMs, reason);
      return interaction.reply({
        embeds: [embeds.success('Timeout Berhasil', `<@${targetUser.id}> telah di-timeout selama **${formatHumanDuration(durationMs)}**.\n**Alasan:** ${reason}`)]
      });
    } catch (err) {
      return interaction.reply({ embeds: [embeds.error('Gagal Memberikan Timeout', err.message)], ephemeral: true });
    }
  }
};
