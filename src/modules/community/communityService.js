/**
 * Community & Interaction Service
 * Handles suggestions with vote tallies, user reports, and event RSVPs.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { COLORS } = require('../../config/constants');

const communityService = {
  /**
   * Handle suggestion vote button click (upvote or downvote)
   */
  async handleVote(interaction) {
    const customId = interaction.customId;
    const isUpvote = customId.startsWith('btn_vote_up_');
    const isDownvote = customId.startsWith('btn_vote_down_');

    if (!isUpvote && !isDownvote) return;

    const messageId = interaction.message.id;
    const userId = interaction.user.id;

    const suggestion = db.get('SELECT * FROM suggestions WHERE message_id = ?', messageId);
    if (!suggestion) {
      return interaction.reply({ content: 'Saran ini tidak terdaftar di database.', ephemeral: true });
    }

    let upvotes = JSON.parse(suggestion.upvotes || '[]');
    let downvotes = JSON.parse(suggestion.downvotes || '[]');

    if (isUpvote) {
      if (upvotes.includes(userId)) {
        // Remove vote
        upvotes = upvotes.filter(id => id !== userId);
      } else {
        upvotes.push(userId);
        downvotes = downvotes.filter(id => id !== userId);
      }
    } else {
      if (downvotes.includes(userId)) {
        // Remove vote
        downvotes = downvotes.filter(id => id !== userId);
      } else {
        downvotes.push(userId);
        upvotes = upvotes.filter(id => id !== userId);
      }
    }

    db.run(
      'UPDATE suggestions SET upvotes = ?, downvotes = ? WHERE id = ?',
      JSON.stringify(upvotes),
      JSON.stringify(downvotes),
      suggestion.id
    );

    // Update buttons with new vote counts
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_vote_up_${suggestion.id}`)
        .setLabel(`Upvote (${upvotes.length})`)
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId(`btn_vote_down_${suggestion.id}`)
        .setLabel(`Downvote (${downvotes.length})`)
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎')
    );

    await interaction.update({ components: [row] });
  },

  /**
   * Handle Event RSVP Button Click
   */
  async handleEventRsvp(interaction) {
    const customId = interaction.customId;
    if (!customId.startsWith('btn_event_rsvp_')) return;

    const eventId = parseInt(customId.replace('btn_event_rsvp_', ''), 10);
    const event = db.get('SELECT * FROM events WHERE id = ?', eventId);
    if (!event) {
      return interaction.reply({ content: 'Event tidak ditemukan.', ephemeral: true });
    }

    const userId = interaction.user.id;
    let attendees = JSON.parse(event.attendees || '[]');

    if (attendees.includes(userId)) {
      attendees = attendees.filter(id => id !== userId);
      db.run('UPDATE events SET attendees = ? WHERE id = ?', JSON.stringify(attendees), eventId);
      return interaction.reply({
        content: `Anda membatalkan keikutsertaan dalam event **${event.title}**.`,
        ephemeral: true
      });
    } else {
      attendees.push(userId);
      db.run('UPDATE events SET attendees = ? WHERE id = ?', JSON.stringify(attendees), eventId);
      return interaction.reply({
        content: `🎉 Anda terdaftar untuk hadir di event **${event.title}**! (Total peserta: ${attendees.length})`,
        ephemeral: true
      });
    }
  }
};

module.exports = communityService;
