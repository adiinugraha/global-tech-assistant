/**
 * Leveling & XP System Service
 * Awards XP on meaningful messages with cooldowns, level curves, and role rewards.
 */

const db = require('../../database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { DEFAULTS, COLORS } = require('../../config/constants');

const levelingService = {
  /**
   * Calculate required XP for a given level
   */
  getXpForLevel(level) {
    // Standard quadratic curve: 5 * level^2 + 50 * level + 100
    return Math.floor(5 * Math.pow(level, 2) + 50 * level + 100);
  },

  /**
   * Calculate cumulative XP required to reach a level
   */
  getTotalXpForLevel(targetLevel) {
    let total = 0;
    for (let l = 0; l < targetLevel; l++) {
      total += this.getXpForLevel(l);
    }
    return total;
  },

  /**
   * Calculate current level from total accumulated XP
   */
  getLevelFromTotalXp(totalXp) {
    let level = 0;
    let accumulated = 0;
    while (true) {
      const needed = this.getXpForLevel(level);
      if (accumulated + needed > totalXp) {
        break;
      }
      accumulated += needed;
      level++;
    }
    return level;
  },

  /**
   * Process incoming message for XP gain
   */
  async handleMessage(message) {
    if (!message.guild || message.author.bot || !message.member) return;

    // Check if leveling is enabled
    const settings = db.getGuildSettings(message.guild.id);
    if (!settings.leveling_enabled) return;

    // Check excluded channels
    const isExcluded = db.get(
      'SELECT 1 FROM level_excluded_channels WHERE guild_id = ? AND channel_id = ?',
      message.guild.id,
      message.channel.id
    );
    if (isExcluded) return;

    // Anti-spam length check (must be at least 3 characters)
    if (message.content.trim().length < 3) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const now = Math.floor(Date.now() / 1000);

    let row = db.get('SELECT * FROM leveling WHERE guild_id = ? AND user_id = ?', guildId, userId);
    if (!row) {
      db.run('INSERT INTO leveling (guild_id, user_id, xp, level, messages_count, last_xp_at) VALUES (?, ?, 0, 0, 0, 0)', guildId, userId);
      row = db.get('SELECT * FROM leveling WHERE guild_id = ? AND user_id = ?', guildId, userId);
    }

    // Check cooldown (60 seconds)
    if (now - row.last_xp_at < DEFAULTS.XP_COOLDOWN_SECONDS) {
      // Just increment message count
      db.run('UPDATE leveling SET messages_count = messages_count + 1 WHERE guild_id = ? AND user_id = ?', guildId, userId);
      return;
    }

    // Random XP between 15 and 25
    const xpGained = Math.floor(Math.random() * (DEFAULTS.XP_PER_MESSAGE_MAX - DEFAULTS.XP_PER_MESSAGE_MIN + 1)) + DEFAULTS.XP_PER_MESSAGE_MIN;
    const newTotalXp = row.xp + xpGained;
    const newLevel = this.getLevelFromTotalXp(newTotalXp);

    db.run(
      'UPDATE leveling SET xp = ?, level = ?, messages_count = messages_count + 1, last_xp_at = ? WHERE guild_id = ? AND user_id = ?',
      newTotalXp,
      newLevel,
      now,
      guildId,
      userId
    );

    // Check Level Up
    if (newLevel > row.level) {
      await this.handleLevelUp(message, newLevel);
    }
  },

  /**
   * Handle level up event and role rewards
   */
  async handleLevelUp(message, newLevel) {
    try {
      const levelUpEmbed = embeds.base(
        '🎉 Level Up!',
        `Selamat <@${message.author.id}>! Anda telah naik ke **Level ${newLevel}**! Terus aktif berkontribusi di komunitas.`,
        COLORS.SUCCESS
      );

      await message.channel.send({ content: `<@${message.author.id}>`, embeds: [levelUpEmbed] }).catch(() => null);

      // Check role reward for this level
      const reward = db.get(
        'SELECT role_id FROM level_rewards WHERE guild_id = ? AND level = ?',
        message.guild.id,
        newLevel
      );

      if (reward) {
        const role = message.guild.roles.cache.get(reward.role_id);
        if (role && message.guild.members.me.roles.highest.position > role.position) {
          await message.member.roles.add(role).catch(err => {
            logger.warn(`Failed to add role reward for level ${newLevel}:`, err.message);
          });
        }
      }
    } catch (err) {
      logger.error('Error handling level up:', err);
    }
  },

  /**
   * Get user rank profile data
   */
  getUserRank(guildId, userId) {
    const row = db.get('SELECT * FROM leveling WHERE guild_id = ? AND user_id = ?', guildId, userId);
    if (!row) return null;

    // Calculate leaderboard rank
    const rankResult = db.get(
      'SELECT COUNT(*) as rank FROM leveling WHERE guild_id = ? AND xp > ?',
      guildId,
      row.xp
    );

    const rank = (rankResult?.rank || 0) + 1;
    const currentLevelXpFloor = this.getTotalXpForLevel(row.level);
    const nextLevelXpFloor = this.getTotalXpForLevel(row.level + 1);
    const currentProgressXp = row.xp - currentLevelXpFloor;
    const neededForNext = nextLevelXpFloor - currentLevelXpFloor;

    return {
      level: row.level,
      xp: row.xp,
      currentProgressXp,
      neededForNext,
      messages: row.messages_count,
      rank
    };
  },

  /**
   * Get Top Leaderboard
   */
  getLeaderboard(guildId, limit = 10) {
    return db.all(
      'SELECT user_id, xp, level, messages_count FROM leveling WHERE guild_id = ? ORDER BY xp DESC LIMIT ?',
      guildId,
      limit
    );
  }
};

module.exports = levelingService;
