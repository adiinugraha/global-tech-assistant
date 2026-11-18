const { SlashCommandBuilder, version: djsVersion } = require('discord.js');
const embeds = require('../../utils/embeds');
const { BOT_NAME, BOT_VERSION } = require('../../config/constants');
const { formatHumanDuration } = require('../../utils/time');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Informasi sistem, status, dan spesifikasi bot Global Tech Assistant'),

  async execute(interaction) {
    const uptime = formatHumanDuration(interaction.client.uptime);
    const totalGuilds = interaction.client.guilds.cache.size;
    const totalUsers = interaction.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    const embed = embeds.base(
      `🤖 ${BOT_NAME} v${BOT_VERSION}`,
      'Asisten multifungsi resmi komunitas teknologi Network Intelligence.'
    )
      .addFields(
        { name: '⏱️ Uptime', value: uptime, inline: true },
        { name: '🌐 Server Aktif', value: `${totalGuilds} server`, inline: true },
        { name: '👥 Total Anggota', value: `${totalUsers.toLocaleString()} pengguna`, inline: true },
        { name: '💻 Node.js', value: process.version, inline: true },
        { name: '📦 Discord.js', value: `v${djsVersion}`, inline: true },
        { name: '🧠 Memori RAM', value: `${memoryUsed} MB`, inline: true },
        { name: '🖥️ Platform OS', value: `${os.type()} ${os.arch()}`, inline: true },
        { name: '⚙️ CPU Core', value: `${os.cpus().length} Core`, inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
