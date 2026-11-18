const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { parseDuration, formatHumanDuration, discordTimestamp } = require('../../utils/time');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Mengatur pengingat / reminder otomatis')
    .addStringOption(opt =>
      opt.setName('durasi')
        .setDescription('Waktu pengingat (contoh: 10m, 1h, 2d)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('pesan')
        .setDescription('Pesan yang ingin diingatkan')
        .setRequired(true)
    ),

  async execute(interaction) {
    const durationStr = interaction.options.getString('durasi');
    const message = interaction.options.getString('pesan');

    const durationMs = parseDuration(durationStr);
    if (!durationMs || durationMs < 5000) {
      return interaction.reply({
        embeds: [embeds.error('Durasi Tidak Valid', 'Format durasi tidak valid (minimal 5 detik). Contoh: `10m`, `2h`, `1d`.')],
        ephemeral: true
      });
    }

    const remindAt = Date.now() + durationMs;

    db.run(
      'INSERT INTO reminders (guild_id, channel_id, user_id, message, remind_at) VALUES (?, ?, ?, ?, ?)',
      interaction.guildId,
      interaction.channelId,
      interaction.user.id,
      message,
      remindAt
    );

    return interaction.reply({
      embeds: [embeds.success(
        'Pengingat Disimpan!',
        `Saya akan mengingatkan Anda ${discordTimestamp(remindAt, 'R')} (${formatHumanDuration(durationMs)} lagi).\n\n**Catatan:** "${message}"`
      )]
    });
  }
};
