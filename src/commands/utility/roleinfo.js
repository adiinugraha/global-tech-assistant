const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { discordTimestamp } = require('../../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Menampilkan informasi detail sebuah role')
    .addRoleOption(opt =>
      opt.setName('role')
        .setDescription('Pilih role yang ingin diperiksa')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const embed = embeds.base(`🛡️ Informasi Role: @${role.name}`, null)
      .setColor(role.color || 0x00A8FF)
      .addFields(
        { name: '🆔 Role ID', value: `\`${role.id}\``, inline: true },
        { name: '🎨 Kode Warna', value: role.hexColor, inline: true },
        { name: '📊 Posisi Hierarki', value: `${role.position}`, inline: true },
        { name: '👥 Jumlah Anggota', value: `${role.members.size} anggota`, inline: true },
        { name: '📌 Hoisted (Terpisah)', value: role.hoist ? 'Ya' : 'Tidak', inline: true },
        { name: '🔔 Mentionable', value: role.mentionable ? 'Ya' : 'Tidak', inline: true },
        { name: '📅 Dibuat Pada', value: discordTimestamp(role.createdAt, 'F'), inline: false }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
