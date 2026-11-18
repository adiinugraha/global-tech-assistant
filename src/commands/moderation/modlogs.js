const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('Melihat catatan tindakan moderasi terbaru')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Filter berdasarkan anggota tertentu (opsional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya moderator yang dapat melihat riwayat moderasi.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    let cases = [];

    if (targetUser) {
      cases = db.all(
        'SELECT * FROM moderation_cases WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 10',
        interaction.guildId,
        targetUser.id
      );
    } else {
      cases = db.all(
        'SELECT * FROM moderation_cases WHERE guild_id = ? ORDER BY created_at DESC LIMIT 10',
        interaction.guildId
      );
    }

    if (cases.length === 0) {
      return interaction.reply({
        embeds: [embeds.info('Catatan Bersih', 'Tidak ada riwayat tindakan moderasi yang tercatat.')]
      });
    }

    const fields = cases.map(c => ({
      name: `Case #${c.id} • ${c.action} (${c.created_at})`,
      value: `**Target:** <@${c.user_id}>\n**Moderator:** <@${c.moderator_id}>\n**Alasan:** ${c.reason}`,
      inline: false
    }));

    const embed = embeds.info('📋 Catatan Moderasi Terbaru', `Menampilkan ${cases.length} tindakan moderasi terakhir:`)
      .addFields(fields);

    return interaction.reply({ embeds: [embed] });
  }
};
