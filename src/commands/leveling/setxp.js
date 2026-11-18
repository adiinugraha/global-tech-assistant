const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const levelingService = require('../../modules/leveling/levelingService');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setxp')
    .setDescription('Mengatur XP dan Level seorang anggota secara manual')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang ingin diatur XP-nya')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('xp')
        .setDescription('Jumlah total XP baru')
        .setMinValue(0)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat mengatur XP.')], ephemeral: true });
    }

    const targetUser = interaction.options.getUser('target');
    const newXp = interaction.options.getInteger('xp');
    const newLevel = levelingService.getLevelFromTotalXp(newXp);

    db.run(
      `INSERT INTO leveling (guild_id, user_id, xp, level, messages_count, last_xp_at)
       VALUES (?, ?, ?, ?, 1, strftime('%s','now'))
       ON CONFLICT(guild_id, user_id) DO UPDATE SET xp = excluded.xp, level = excluded.level`,
      interaction.guildId,
      targetUser.id,
      newXp,
      newLevel
    );

    return interaction.reply({
      embeds: [embeds.success(
        'XP Berhasil Diatur',
        `Data untuk <@${targetUser.id}> telah diperbarui:\n• **Total XP:** ${newXp.toLocaleString()}\n• **Level:** ${newLevel}`
      )]
    });
  }
};
