const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Mengatur status AFK Anda dengan pesan otomatis saat di-mention')
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan Anda sedang AFK')
        .setRequired(false)
    ),

  async execute(interaction) {
    const reason = interaction.options.getString('alasan') || 'Sedang AFK';
    const now = Math.floor(Date.now() / 1000);

    db.run(
      `INSERT INTO afk_status (guild_id, user_id, reason, afk_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(guild_id, user_id) DO UPDATE SET reason = excluded.reason, afk_at = excluded.afk_at`,
      interaction.guildId,
      interaction.user.id,
      reason,
      now
    );

    return interaction.reply({
      embeds: [embeds.info('Status AFK Diaktifkan', `Status Anda sekarang diatur sebagai **AFK**: "${reason}". Status akan otomatis dibatalkan saat Anda mengirim pesan lagi.`)]
    });
  }
};
