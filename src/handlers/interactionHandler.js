/**
 * Master Interaction Handler
 * Routes Slash Commands, Buttons, Select Menus, and Modals with centralized error boundary.
 */

const logger = require('../utils/logger');
const embeds = require('../utils/embeds');
const welcomeService = require('../modules/welcome/welcomeService');
const autoroleService = require('../modules/autorole/autoroleService');
const ticketService = require('../modules/ticket/ticketService');
const communityService = require('../modules/community/communityService');

async function handleInteraction(interaction) {
  try {
    // 1. Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        logger.warn(`Unknown command requested: ${interaction.commandName}`);
        return interaction.reply({
          embeds: [embeds.error('Perintah Tidak Ditemukan', 'Perintah ini tidak terdaftar pada bot.')],
          ephemeral: true
        });
      }

      await command.execute(interaction);
      return;
    }

    // 2. Button Interactions
    if (interaction.isButton()) {
      const customId = interaction.customId;

      // Verification
      if (customId === 'btn_verify_member') {
        return await welcomeService.handleVerificationButton(interaction);
      }

      // Auto / Reaction Role
      if (customId.startsWith('btn_autorole_')) {
        return await autoroleService.handleRoleButton(interaction);
      }

      // Ticket Buttons
      if (customId.startsWith('ticket_claim_')) {
        return await ticketService.handleClaim(interaction);
      }
      if (customId.startsWith('ticket_close_')) {
        return await ticketService.handleClose(interaction);
      }
      if (customId.startsWith('ticket_delete_')) {
        return await ticketService.handleDelete(interaction);
      }

      // Suggestion Vote Buttons
      if (customId.startsWith('btn_vote_up_') || customId.startsWith('btn_vote_down_')) {
        return await communityService.handleVote(interaction);
      }

      // Event RSVP
      if (customId.startsWith('btn_event_rsvp_')) {
        return await communityService.handleEventRsvp(interaction);
      }
    }

    // 3. String Select Menus
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_ticket_category') {
        const selectedValue = interaction.values[0];
        return await ticketService.createTicket(interaction, selectedValue);
      }
    }
  } catch (err) {
    logger.error('Error handling interaction:', err);

    const errorMessage = {
      embeds: [embeds.error('Terjadi Kesalahan', 'Terjadi kesalahan sistem saat memproses interaksi ini. Silakan coba lagi nanti.')],
      ephemeral: true
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(errorMessage).catch(() => null);
    } else {
      await interaction.reply(errorMessage).catch(() => null);
    }
  }
}

module.exports = { handleInteraction };
