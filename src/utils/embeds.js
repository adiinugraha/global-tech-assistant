/**
 * Embed Factory & Templates for Global Tech Assistant
 * Ensures unified visual style across all bot responses.
 */

const { EmbedBuilder } = require('discord.js');
const { COLORS, FOOTER_TEXT } = require('../config/constants');

const embeds = {
  /**
   * Base embed template with standard styling
   */
  base(title, description, color = COLORS.PRIMARY) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setFooter({ text: FOOTER_TEXT })
      .setTimestamp();

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    return embed;
  },

  success(title, description) {
    return embeds.base(`✅ ${title}`, description, COLORS.SUCCESS);
  },

  error(title, description) {
    return embeds.base(`❌ ${title}`, description, COLORS.ERROR);
  },

  warning(title, description) {
    return embeds.base(`⚠️ ${title}`, description, COLORS.WARNING);
  },

  info(title, description) {
    return embeds.base(`ℹ️ ${title}`, description, COLORS.INFO);
  },

  /**
   * Moderation action embed for logs and user notifications
   */
  modLog({ action, target, moderator, reason, duration, caseId }) {
    const embed = new EmbedBuilder()
      .setColor(action.includes('BAN') || action.includes('KICK') ? COLORS.ERROR : COLORS.WARNING)
      .setTitle(`🛡️ Moderation Action: ${action}`)
      .addFields(
        { name: 'Target User', value: `${target.tag || target.user?.tag || target.id} (\`${target.id}\`)`, inline: true },
        { name: 'Moderator', value: `${moderator.tag || moderator.user?.tag || moderator.id}`, inline: true },
        { name: 'Reason', value: reason || 'Tidak ada alasan yang diberikan', inline: false }
      )
      .setFooter({ text: `${FOOTER_TEXT} • Case #${caseId || 'N/A'}` })
      .setTimestamp();

    if (duration) {
      embed.addFields({ name: 'Duration', value: duration, inline: true });
    }

    return embed;
  },

  /**
   * Audit log embed
   */
  auditLog({ title, description, color = COLORS.INFO, fields = [] }) {
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`📋 Audit Log: ${title}`)
      .setDescription(description)
      .setFooter({ text: FOOTER_TEXT })
      .setTimestamp();

    if (fields.length > 0) {
      embed.addFields(fields);
    }
    return embed;
  }
};

module.exports = embeds;
