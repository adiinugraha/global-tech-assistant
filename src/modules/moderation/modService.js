/**
 * Moderation Service
 * Handles core moderation actions, case logging, warnings, and permission safety.
 */

const { PermissionsBitField } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { canModerateTarget } = require('../../utils/permissions');

const modService = {
  /**
   * Log a case in DB and dispatch to the guild's log channel
   */
  async logCase(guild, { action, target, moderator, reason, duration }) {
    try {
      const result = db.run(
        `INSERT INTO moderation_cases (guild_id, user_id, moderator_id, action, reason, duration)
         VALUES (?, ?, ?, ?, ?, ?)`,
        guild.id,
        target.id,
        moderator.id,
        action,
        reason || 'Tidak ada alasan yang diberikan',
        duration || null
      );

      const caseId = result.lastInsertRowid;
      const settings = db.getGuildSettings(guild.id);

      if (settings.log_channel_id) {
        const logChannel = await guild.channels.fetch(settings.log_channel_id).catch(() => null);
        if (logChannel && logChannel.isTextBased()) {
          const embed = embeds.modLog({
            action,
            target,
            moderator,
            reason,
            duration: duration ? `${duration / 1000} detik` : null,
            caseId
          });
          await logChannel.send({ embeds: [embed] }).catch(() => null);
        }
      }

      return caseId;
    } catch (err) {
      logger.error('Error in logCase:', err);
      return null;
    }
  },

  /**
   * Warn a member
   */
  async warn(guild, targetMember, moderatorUser, reason) {
    db.run(
      'INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)',
      guild.id,
      targetMember.id,
      moderatorUser.id,
      reason
    );

    await modService.logCase(guild, {
      action: 'WARN',
      target: targetMember.user || targetMember,
      moderator: moderatorUser,
      reason
    });

    // Try DMing target
    targetMember.send({
      embeds: [embeds.warning(`Peringatan dari Server ${guild.name}`, `**Alasan:** ${reason}`)]
    }).catch(() => null);

    return true;
  },

  /**
   * Get warnings for a user
   */
  getWarnings(guildId, userId) {
    return db.all('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC', guildId, userId);
  },

  /**
   * Clear warnings for a user
   */
  clearWarnings(guildId, userId) {
    return db.run('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?', guildId, userId);
  },

  /**
   * Timeout a member
   */
  async timeout(guild, targetMember, moderatorUser, durationMs, reason) {
    const check = canModerateTarget(await guild.members.fetch(moderatorUser.id), targetMember);
    if (!check.can) throw new Error(check.reason);

    await targetMember.timeout(durationMs, reason);

    await modService.logCase(guild, {
      action: 'TIMEOUT',
      target: targetMember.user,
      moderator: moderatorUser,
      reason,
      duration: durationMs
    });

    targetMember.send({
      embeds: [embeds.warning(`Anda telah di-timeout di ${guild.name}`, `**Durasi:** ${durationMs / 1000} detik\n**Alasan:** ${reason}`)]
    }).catch(() => null);
  },

  /**
   * Remove timeout
   */
  async untimeout(guild, targetMember, moderatorUser, reason) {
    await targetMember.timeout(null, reason);

    await modService.logCase(guild, {
      action: 'UNTIMEOUT',
      target: targetMember.user,
      moderator: moderatorUser,
      reason
    });
  },

  /**
   * Kick a member
   */
  async kick(guild, targetMember, moderatorUser, reason) {
    const check = canModerateTarget(await guild.members.fetch(moderatorUser.id), targetMember);
    if (!check.can) throw new Error(check.reason);

    await targetMember.send({
      embeds: [embeds.error(`Anda dikeluarkan (Kick) dari ${guild.name}`, `**Alasan:** ${reason}`)]
    }).catch(() => null);

    await targetMember.kick(reason);

    await modService.logCase(guild, {
      action: 'KICK',
      target: targetMember.user,
      moderator: moderatorUser,
      reason
    });
  },

  /**
   * Ban a member
   */
  async ban(guild, userId, moderatorUser, reason, deleteMessageDays = 0) {
    await guild.members.ban(userId, {
      reason,
      deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
    });

    await modService.logCase(guild, {
      action: 'BAN',
      target: { id: userId, tag: `User ID: ${userId}` },
      moderator: moderatorUser,
      reason
    });
  },

  /**
   * Unban a user
   */
  async unban(guild, userId, moderatorUser, reason) {
    await guild.members.unban(userId, reason);

    await modService.logCase(guild, {
      action: 'UNBAN',
      target: { id: userId, tag: `User ID: ${userId}` },
      moderator: moderatorUser,
      reason
    });
  },

  /**
   * Purge messages in a channel
   */
  async purge(channel, amount, moderatorUser, filterUser = null) {
    let messages = await channel.messages.fetch({ limit: Math.min(amount, 100) });
    if (filterUser) {
      messages = messages.filter(m => m.author.id === filterUser.id);
    }

    const deleted = await channel.bulkDelete(messages, true);

    await modService.logCase(channel.guild, {
      action: 'PURGE',
      target: { id: channel.id, tag: `#${channel.name}` },
      moderator: moderatorUser,
      reason: `Menghapus ${deleted.size} pesan${filterUser ? ` dari @${filterUser.tag}` : ''}`
    });

    return deleted.size;
  },

  /**
   * Lock a channel
   */
  async lockChannel(channel, reason = 'Channel locked by moderator') {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: false,
      AddReactions: false
    }, { reason });
  },

  /**
   * Unlock a channel
   */
  async unlockChannel(channel, reason = 'Channel unlocked by moderator') {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: null,
      AddReactions: null
    }, { reason });
  }
};

module.exports = modService;
