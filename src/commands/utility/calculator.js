const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calculator')
    .setDescription('Kalkulator matematika sederhana dan aman')
    .addStringOption(opt =>
      opt.setName('ekspresi')
        .setDescription('Ekspresi matematika (contoh: 25 * 4 + (10 / 2))')
        .setRequired(true)
    ),

  async execute(interaction) {
    const expr = interaction.options.getString('ekspresi').trim();

    // Whitelist only safe mathematical characters: numbers, spaces, +, -, *, /, %, (, ), .
    if (!/^[0-9+\-*/%().\s]+$/.test(expr)) {
      return interaction.reply({
        embeds: [embeds.error('Input Tidak Aman', 'Hanya angka dan operator dasar (+, -, *, /, %, kurung) yang diizinkan.')],
        ephemeral: true
      });
    }

    try {
      // Safe evaluation using Function with no globals
      const result = new Function(`'use strict'; return (${expr});`)();
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Hasil tidak terdefinisi atau tidak valid.');
      }

      const embed = embeds.success('Hasil Kalkulasi', `\`\`\`fix\n${expr} = ${result}\n\`\`\``);
      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({
        embeds: [embeds.error('Kesalahan Sintaks', 'Ekspresi matematika yang Anda masukkan tidak valid.')],
        ephemeral: true
      });
    }
  }
};
