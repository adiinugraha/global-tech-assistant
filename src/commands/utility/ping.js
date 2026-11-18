const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Memeriksa latensi dan respon bot'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Mengukur latensi...', fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    const embed = embeds.success('Pong!', `📶 **WebSocket Latency:** ${wsLatency}ms\n⚡ **Roundtrip Latency:** ${roundtrip}ms`);
    return interaction.editReply({ content: null, embeds: [embed] });
  }
};
