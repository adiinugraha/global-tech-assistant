const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Melaporkan anggota atau insiden kepada moderator secara rahasia')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Anggota yang dilaporkan')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('alasan')
        .setDescription('Alasan dan bukti singkat laporan')
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('alasan');
    const settings = db.getGuildSettings(interaction.guildId);

    const reportChannelId = settings.report_channel_id || settings.log_channel_id;
    if (!reportChannelId) {
      return interaction.reply({
        embeds: [embeds.error('Kanal Belum Disetel', 'Admin belum menentukan kanal laporan (`report_channel_id`).')],
        ephemeral: true
      });
    }

    const channel = await interaction.guild.channels.fetch(reportChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        embeds: [embeds.error('Gagal', 'Kanal laporan tidak ditemukan atau bot tidak dapat mengirim pesan.')],
        ephemeral: true
      });
    }

    const reportEmbed = embeds.warning(
      '🚨 Laporan Anggota Masuk',
      `**Pelapor:** <@${interaction.user.id}> (\`${interaction.user.id}\`)\n` +
      `**Terlapor:** <@${targetUser.id}> (\`${targetUser.id}\`)\n` +
      `**Kanal Asal:** <#${interaction.channelId}>\n\n` +
      `**Detail Pelanggaran:**\n${reason}`
    );

    await channel.send({ embeds: [reportEmbed] });

    return interaction.reply({
      embeds: [embeds.success('Laporan Diterima', 'Laporan Anda telah diteruskan secara privat kepada tim moderator. Terima kasih atas kepedulian Anda menjaga keamanan server!')],
      ephemeral: true
    });
  }
};
