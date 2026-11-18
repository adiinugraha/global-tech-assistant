/**
 * Audit Logging Service
 * Sends structured log events to the designated log channel without leaking sensitive data.
 */

const db = require('../../database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { COLORS } = require('../../config/constants');
const { discordTimestamp } = require('../../utils/time');

const auditLogger = {
  /**
   * Helper to dispatch log embed to guild log channel
   */
  async sendLog(guild, embed) {
    if (!guild) return;
    try {
      const settings = db.getGuildSettings(guild.id);
      if (!settings.log_channel_id) return;

      const channel = await guild.channels.fetch(settings.log_channel_id).catch(() => null);
      if (channel && channel.isTextBased()) {
        await channel.send({ embeds: [embed] }).catch(() => null);
      }
    } catch (err) {
      logger.error('Failed to send audit log:', err);
    }
  },

  /**
   * Message Deleted Event
   */
  async logMessageDelete(message) {
    if (!message || !message.guild || message.author?.bot) return;

    const embed = embeds.auditLog({
      title: 'Pesan Dihapus (Message Deleted)',
      description: `Pesan oleh <@${message.author.id}> (\`${message.author.id}\`) di kanal <#${message.channel.id}> telah dihapus.`,
      color: COLORS.ERROR,
      fields: [
        { name: 'Isi Pesan', value: message.cleanContent ? message.cleanContent.slice(0, 1000) : '*[Tidak ada konten teks / media]*', inline: false }
      ]
    });

    await this.sendLog(message.guild, embed);
  },

  /**
   * Message Edited Event
   */
  async logMessageUpdate(oldMessage, newMessage) {
    if (!oldMessage || !newMessage || !newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Ignore embed updates etc.

    const embed = embeds.auditLog({
      title: 'Pesan Diedit (Message Edited)',
      description: `Pesan oleh <@${newMessage.author.id}> di kanal <#${newMessage.channel.id}> telah disunting. [Lihat Pesan](${newMessage.url})`,
      color: COLORS.WARNING,
      fields: [
        { name: 'Sebelumnya', value: oldMessage.cleanContent ? oldMessage.cleanContent.slice(0, 500) : '*[Kosong]*', inline: false },
        { name: 'Sesudahnya', value: newMessage.cleanContent ? newMessage.cleanContent.slice(0, 500) : '*[Kosong]*', inline: false }
      ]
    });

    await this.sendLog(newMessage.guild, embed);
  },

  /**
   * Member Role or Nickname Update
   */
  async logMemberUpdate(oldMember, newMember) {
    if (!newMember || !newMember.guild) return;

    // Nickname update
    if (oldMember.nickname !== newMember.nickname) {
      const embed = embeds.auditLog({
        title: 'Nickname Anggota Diubah',
        description: `Nickname <@${newMember.id}> (\`${newMember.user.tag}\`) telah diperbarui.`,
        color: COLORS.INFO,
        fields: [
          { name: 'Sebelumnya', value: oldMember.nickname || oldMember.user.username, inline: true },
          { name: 'Sesudahnya', value: newMember.nickname || newMember.user.username, inline: true }
        ]
      });
      await this.sendLog(newMember.guild, embed);
    }

    // Role updates
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const removedRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id));

    if (addedRoles.size > 0 || removedRoles.size > 0) {
      const fields = [];
      if (addedRoles.size > 0) {
        fields.push({ name: 'Role Ditambahkan', value: addedRoles.map(r => `<@&${r.id}>`).join(', '), inline: false });
      }
      if (removedRoles.size > 0) {
        fields.push({ name: 'Role Dihapus', value: removedRoles.map(r => `<@&${r.id}>`).join(', '), inline: false });
      }

      const embed = embeds.auditLog({
        title: 'Perubahan Role Anggota',
        description: `Role pengguna <@${newMember.id}> diperbarui.`,
        color: COLORS.PRIMARY,
        fields
      });
      await this.sendLog(newMember.guild, embed);
    }
  },

  /**
   * Voice State Update (Join, Leave, Move)
   */
  async logVoiceStateUpdate(oldState, newState) {
    const member = newState.member || oldState.member;
    if (!member || !member.guild) return;

    let desc = '';
    if (!oldState.channelId && newState.channelId) {
      desc = `🔊 <@${member.id}> bergabung ke voice channel <#${newState.channelId}>.`;
    } else if (oldState.channelId && !newState.channelId) {
      desc = `🚪 <@${member.id}> meninggalkan voice channel <#${oldState.channelId}>.`;
    } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      desc = `🔄 <@${member.id}> berpindah voice channel dari <#${oldState.channelId}> ke <#${newState.channelId}>.`;
    } else {
      return;
    }

    const embed = embeds.auditLog({
      title: 'Aktivitas Voice Channel',
      description: desc,
      color: COLORS.INFO
    });
    await this.sendLog(member.guild, embed);
  }
};

module.exports = auditLogger;
