/**
 * Auto Moderation & Anti-Raid Service
 * Evaluates messages and guild events in real-time, executing graded enforcement.
 */

const { PermissionsBitField } = require('discord.js');
const db = require('../../database');
const { containsDiscordInvite, containsLinks, countMentions, containsBadWords } = require('../../utils/sanitizer');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

// In-memory message tracking for spam detection: guildId_userId -> array of timestamps
const userMessageVelocity = new Map();
// Repeated content tracking: guildId_userId -> { content, count }
const userLastMessages = new Map();
// Anti-raid join tracker: guildId -> array of timestamps
const guildRecentJoins = new Map();

const automodService = {
  /**
   * Main inspection point for all user messages
   * Returns true if message was intercepted/deleted, false if clean
   */
  async handleMessage(message) {
    if (!message.guild || message.author.bot || !message.member) return false;

    // Check if automod is globally enabled for this guild
    const settings = db.getGuildSettings(message.guild.id);
    if (!settings.automod_enabled) return false;

    const rules = db.getAutomodRules(message.guild.id);

    // Skip trusted channels
    if (rules.trusted_channels.includes(message.channel.id)) return false;

    // Skip trusted roles or users with ManageMessages/Admin
    if (
      message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) ||
      message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
      message.member.roles.cache.some(r => rules.trusted_roles.includes(r.id))
    ) {
      return false;
    }

    const content = message.content || '';
    const userId = message.author.id;
    const guildId = message.guild.id;
    const trackKey = `${guildId}_${userId}`;

    // 1. Bad Words Filter
    if (rules.bad_words_enabled && rules.bad_words.length > 0) {
      if (containsBadWords(content, rules.bad_words)) {
        await this.punishViolation(message, 'Kata Terlarang / Inappropriate Language', 'DELETE_AND_WARN');
        return true;
      }
    }

    // 2. Discord Invite Filter
    if (rules.invite_filter_enabled && containsDiscordInvite(content)) {
      await this.punishViolation(message, 'Promosi Tautan Discord Invite Tidak Diizinkan', 'DELETE_AND_WARN');
      return true;
    }

    // 3. General Links Filter
    if (rules.link_filter_enabled && containsLinks(content)) {
      await this.punishViolation(message, 'Tautan Luar / External Link Filter', 'DELETE_AND_WARN');
      return true;
    }

    // 4. Mass Mention Filter
    if (rules.mass_mention_enabled) {
      const mentionsCount = countMentions(content);
      if (mentionsCount >= (rules.mass_mention_threshold || 4)) {
        await this.punishViolation(message, `Mass Mention (${mentionsCount} mention)`, 'DELETE_AND_TIMEOUT', 5 * 60 * 1000);
        return true;
      }
    }

    // 5. Spam Velocity & Repetition Filter
    if (rules.spam_enabled) {
      const now = Date.now();
      const timestamps = userMessageVelocity.get(trackKey) || [];
      const recent = timestamps.filter(t => now - t < 5000); // within 5 seconds
      recent.push(now);
      userMessageVelocity.set(trackKey, recent);

      if (recent.length >= (rules.spam_threshold || 5)) {
        await this.punishViolation(message, 'Spam Pengiriman Pesan Cepat', 'DELETE_AND_TIMEOUT', 2 * 60 * 1000);
        userMessageVelocity.delete(trackKey);
        return true;
      }

      // Check repeated text
      const lastMsg = userLastMessages.get(trackKey);
      if (lastMsg && lastMsg.content === content.trim() && content.trim().length > 4) {
        lastMsg.count += 1;
        if (lastMsg.count >= 3) {
          await this.punishViolation(message, 'Pengulangan Teks / Text Duplication', 'DELETE_AND_WARN');
          userLastMessages.delete(trackKey);
          return true;
        }
      } else {
        userLastMessages.set(trackKey, { content: content.trim(), count: 1 });
      }
    }

    return false;
  },

  /**
   * Execute graded punishment
   */
  async punishViolation(message, reason, severity = 'DELETE_AND_WARN', timeoutMs = 60 * 1000) {
    try {
      if (message.deletable) {
        await message.delete().catch(() => null);
      }

      const warningMsg = await message.channel.send({
        embeds: [embeds.warning('Auto Moderation Action', `<@${message.author.id}>, pesan Anda dihapus karena: **${reason}**`)]
      }).catch(() => null);

      // Auto delete warning message after 6 seconds to keep chat clean
      if (warningMsg) {
        setTimeout(() => warningMsg.delete().catch(() => null), 6000);
      }

      // Apply timeout if escalated
      if (severity === 'DELETE_AND_TIMEOUT' && message.member.moderatable) {
        await message.member.timeout(timeoutMs, `[AutoMod] ${reason}`).catch(() => null);
      }

      // Log to guild mod log channel
      const settings = db.getGuildSettings(message.guild.id);
      if (settings.log_channel_id) {
        const logChannel = await message.guild.channels.fetch(settings.log_channel_id).catch(() => null);
        if (logChannel && logChannel.isTextBased()) {
          const logEmbed = embeds.auditLog({
            title: 'AutoMod Violation Intercepted',
            description: `**Pengguna:** <@${message.author.id}> (\`${message.author.id}\`)\n**Kanal:** <#${message.channel.id}>\n**Pelanggaran:** ${reason}\nTindakan: Pesan dihapus${severity === 'DELETE_AND_TIMEOUT' ? ` & Timeout ${timeoutMs / 1000}s` : ''}`
          });
          await logChannel.send({ embeds: [logEmbed] }).catch(() => null);
        }
      }
    } catch (err) {
      logger.error('Error executing AutoMod punishment:', err);
    }
  },

  /**
   * Anti-Raid detection when member joins
   * If > 8 joins in 10s, triggers lockdown alerts
   */
  async handleMemberJoin(member) {
    const guildId = member.guild.id;
    const rules = db.getAutomodRules(guildId);
    if (!rules.anti_raid_enabled) return;

    const now = Date.now();
    const joins = guildRecentJoins.get(guildId) || [];
    const recent = joins.filter(t => now - t < 10000); // 10 seconds window
    recent.push(now);
    guildRecentJoins.set(guildId, recent);

    if (recent.length >= 8) {
      logger.warn(`Potential raid detected in guild ${member.guild.name} (${guildId})! ${recent.length} joins in 10s.`);
      
      const settings = db.getGuildSettings(guildId);
      if (settings.log_channel_id) {
        const logChannel = await member.guild.channels.fetch(settings.log_channel_id).catch(() => null);
        if (logChannel && logChannel.isTextBased()) {
          const alert = embeds.error(
            '🚨 DETEKSI POTENSI RAID (Mass Join Alert)',
            `Terdeteksi **${recent.length} anggota baru** bergabung dalam rentang 10 detik!\nModerator disarankan mengaktifkan mode lockdown melalui \`/lockdown\`.`
          );
          await logChannel.send({ embeds: [alert] }).catch(() => null);
        }
      }
    }
  }
};

module.exports = automodService;
