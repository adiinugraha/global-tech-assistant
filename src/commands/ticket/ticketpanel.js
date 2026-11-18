const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ticketService = require('../../modules/ticket/ticketService');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Mengirim panel tiket interaktif ke kanal ini')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat memasang panel tiket.')], ephemeral: true });
    }

    const payload = ticketService.createPanelPayload();
    await interaction.channel.send(payload);

    return interaction.reply({
      embeds: [embeds.success('Panel Tiket Terpasang', 'Panel bantuan dan tiket telah dipublikasikan di kanal ini.')],
      ephemeral: true
    });
  }
};
