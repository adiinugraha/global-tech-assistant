const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { discordTimestamp } = require('../../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Menampilkan detail dan statistik kanal Discord')
    .addChannelOption(opt =>
      opt.setName('kanal')
        .setDescription('Pilih kanal (kosongkan untuk kanal saat ini)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    const embed = embeds.base(`📁 Informasi Kanal: #${channel.name}`, null)
      .addFields(
        { name: '🆔 Channel ID', value: `\`${channel.id}\``, inline: true },
        { name: '🏷️ Tipe Kanal', value: `${channel.type}`, inline: true },
        { name: '📂 Kategori Induk', value: channel.parent ? channel.parent.name : 'Tidak ada', inline: true },
        { name: '📝 Topik Kanal', value: channel.topic || 'Tidak ada topik yang disetel', inline: false },
        { name: '📅 Dibuat Pada', value: discordTimestamp(channel.createdAt, 'F'), inline: false }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
