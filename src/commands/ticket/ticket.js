const { SlashCommandBuilder } = require('discord.js');
const ticketService = require('../../modules/ticket/ticketService');
const { TICKET_CATEGORIES } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Membuka tiket bantuan secara langsung')
    .addStringOption(opt =>
      opt.setName('kategori')
        .setDescription('Pilih kategori bantuan')
        .setRequired(true)
        .addChoices(
          ...TICKET_CATEGORIES.map(c => ({ name: `${c.emoji} ${c.label}`, value: c.value }))
        )
    ),

  async execute(interaction) {
    const category = interaction.options.getString('kategori');
    await ticketService.createTicket(interaction, category);
  }
};
