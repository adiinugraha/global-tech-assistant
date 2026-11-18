const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timestamp')
    .setDescription('Membuat tag timestamp dinamis Discord')
    .addIntegerOption(opt =>
      opt.setName('menit_kedepan')
        .setDescription('Berapa menit dari sekarang?')
        .setRequired(true)
    ),

  async execute(interaction) {
    const minutes = interaction.options.getInteger('menit_kedepan');
    const targetUnix = Math.floor((Date.now() + minutes * 60 * 1000) / 1000);

    const embed = embeds.info(
      '🕒 Generator Timestamp Discord',
      `Target: **${minutes} menit dari sekarang**\n\n` +
      `• **Relatif:** \`<t:${targetUnix}:R>\` ➔ <t:${targetUnix}:R>\n` +
      `• **Lengkap:** \`<t:${targetUnix}:F>\` ➔ <t:${targetUnix}:F>\n` +
      `• **Waktu Pendek:** \`<t:${targetUnix}:t>\` ➔ <t:${targetUnix}:t>\n` +
      `• **Tanggal Pendek:** \`<t:${targetUnix}:d>\` ➔ <t:${targetUnix}:d>`
    );

    return interaction.reply({ embeds: [embed] });
  }
};
