const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Mengirim kritik atau masukan konstruktif untuk server')
    .addStringOption(opt =>
      opt.setName('pesan')
        .setDescription('Masukan atau ulasan Anda')
        .setRequired(true)
    ),

  async execute(interaction) {
    const feedback = interaction.options.getString('pesan');
    const settings = db.getGuildSettings(interaction.guildId);

    const targetChannelId = settings.report_channel_id || settings.log_channel_id;
    if (targetChannelId) {
      const channel = await interaction.guild.channels.fetch(targetChannelId).catch(() => null);
      if (channel && channel.isTextBased()) {
        const embed = embeds.info(
          '💬 Masukan / Feedback Baru',
          `Dari: <@${interaction.user.id}>\n\n"${feedback}"`
        );
        await channel.send({ embeds: [embed] }).catch(() => null);
      }
    }

    return interaction.reply({
      embeds: [embeds.success('Masukan Diterima', 'Terima kasih telah memberikan masukan untuk kemajuan server kami!')],
      ephemeral: true
    });
  }
};
