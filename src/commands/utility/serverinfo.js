const { SlashCommandBuilder, ChannelType } = require('discord.js');
const embeds = require('../../utils/embeds');
const { discordTimestamp } = require('../../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Menampilkan informasi detail server Discord ini'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();

    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

    const embed = embeds.base(`🌐 Informasi Server: ${guild.name}`, null)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '👑 Pemilik Server', value: `<@${owner.id}> (${owner.user.tag})`, inline: true },
        { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
        { name: '📅 Tanggal Dibuat', value: discordTimestamp(guild.createdAt, 'F'), inline: false },
        { name: '👥 Total Anggota', value: `${guild.memberCount.toLocaleString()} anggota`, inline: true },
        { name: '🛡️ Jumlah Role', value: `${guild.roles.cache.size} role`, inline: true },
        { name: '🚀 Tingkat Boost', value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount} Boost)`, inline: true },
        { name: '💬 Total Kanal', value: `📁 ${categories} Kategori | 💬 ${textChannels} Teks | 🔊 ${voiceChannels} Suara`, inline: false }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
