/**
 * Auto Role & Reaction/Button Role Service
 * Handles persistent role panel interactions with allowlist enforcement.
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

const autoroleService = {
  /**
   * Handle when a member clicks a role button
   */
  async handleRoleButton(interaction) {
    const customId = interaction.customId;
    if (!customId.startsWith('btn_autorole_')) return;

    const roleId = customId.replace('btn_autorole_', '');
    const guild = interaction.guild;
    const member = interaction.member;

    // Verify role exists and is in database allowlist for this guild
    const record = db.get(
      'SELECT * FROM reaction_roles WHERE guild_id = ? AND role_id = ?',
      guild.id,
      roleId
    );

    if (!record) {
      return interaction.reply({
        content: 'Role ini tidak terdaftar dalam sistem role panel resmi server.',
        ephemeral: true
      });
    }

    const role = guild.roles.cache.get(roleId);
    if (!role) {
      return interaction.reply({
        content: 'Role yang dituju tidak lagi ada di server.',
        ephemeral: true
      });
    }

    // Role hierarchy check for bot
    if (guild.members.me.roles.highest.position <= role.position) {
      return interaction.reply({
        content: 'Bot tidak memiliki izin hierarki yang cukup untuk mengelola role ini.',
        ephemeral: true
      });
    }

    try {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        return interaction.reply({
          embeds: [embeds.info('Role Dicabut', `Role <@&${role.id}> telah dihapus dari akun Anda.`)],
          ephemeral: true
        });
      } else {
        await member.roles.add(role);
        return interaction.reply({
          embeds: [embeds.success('Role Diberikan', `Role <@&${role.id}> berhasil ditambahkan ke akun Anda!`)],
          ephemeral: true
        });
      }
    } catch (err) {
      logger.error('Failed to toggle role:', err);
      return interaction.reply({
        content: `Gagal memperbarui role: ${err.message}`,
        ephemeral: true
      });
    }
  }
};

module.exports = autoroleService;
