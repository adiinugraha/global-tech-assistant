/**
 * Welcome, Goodbye & Verification Service
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { COLORS } = require('../../config/constants');
const { discordTimestamp } = require('../../utils/time');

const welcomeService = {
  /**
   * Handle when a member joins
   */
  async handleMemberJoin(member) {
    try {
      const guild = member.guild;
      const settings = db.getGuildSettings(guild.id);

      // 1. Auto Role
      if (settings.auto_role_id) {
        const autoRole = guild.roles.cache.get(settings.auto_role_id);
        if (autoRole && guild.members.me.roles.highest.position > autoRole.position) {
          await member.roles.add(autoRole).catch(err => {
            logger.warn(`Failed to assign auto role ${settings.auto_role_id}:`, err.message);
          });
        }
      }

      // 2. Welcome Channel Announcement
      if (settings.welcome_channel_id) {
        const channel = await guild.channels.fetch(settings.welcome_channel_id).catch(() => null);
        if (channel && channel.isTextBased()) {
          const rawMessage = settings.welcome_message || 'Selamat datang di **{server}**, {user}! 🎉 Silakan baca panduan dan aturan kami.';
          const formatted = rawMessage
            .replaceAll('{user}', `<@${member.id}>`)
            .replaceAll('{username}', member.user.username)
            .replaceAll('{server}', guild.name)
            .replaceAll('{memberCount}', guild.memberCount.toString());

          const embed = embeds.base(`👋 Selamat Datang!`, formatted, COLORS.PRIMARY)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
              { name: 'Akun Dibuat', value: discordTimestamp(member.user.createdAt, 'R'), inline: true },
              { name: 'Anggota Ke-', value: `#${guild.memberCount}`, inline: true }
            );

          // Verification button if verified role is configured
          let components = [];
          if (settings.verified_role_id) {
            const verifyBtn = new ButtonBuilder()
              .setCustomId('btn_verify_member')
              .setLabel('Verifikasi Anggota')
              .setStyle(ButtonStyle.Success)
              .setEmoji('✅');
            components = [new ActionRowBuilder().addComponents(verifyBtn)];
          }

          await channel.send({ content: `<@${member.id}>`, embeds: [embed], components }).catch(() => null);
        }
      }
    } catch (err) {
      logger.error('Error in welcomeService.handleMemberJoin:', err);
    }
  },

  /**
   * Handle when a member leaves
   */
  async handleMemberRemove(member) {
    try {
      const guild = member.guild;
      const settings = db.getGuildSettings(guild.id);

      if (settings.goodbye_channel_id) {
        const channel = await guild.channels.fetch(settings.goodbye_channel_id).catch(() => null);
        if (channel && channel.isTextBased()) {
          const rawMessage = settings.goodbye_message || 'Selamat tinggal **{username}** dari {server}. Sampai jumpa lagi!';
          const formatted = rawMessage
            .replaceAll('{username}', member.user?.username || member.displayName || 'Anggota')
            .replaceAll('{server}', guild.name)
            .replaceAll('{memberCount}', guild.memberCount.toString());

          const embed = embeds.base('👋 Sampai Jumpa', formatted, COLORS.DARK)
            .setThumbnail(member.user?.displayAvatarURL({ dynamic: true }) || null);

          await channel.send({ embeds: [embed] }).catch(() => null);
        }
      }
    } catch (err) {
      logger.error('Error in welcomeService.handleMemberRemove:', err);
    }
  },

  /**
   * Handle verification button click
   */
  async handleVerificationButton(interaction) {
    const settings = db.getGuildSettings(interaction.guildId);
    if (!settings.verified_role_id) {
      return interaction.reply({
        content: 'Role verifikasi belum disetel oleh admin server.',
        ephemeral: true
      });
    }

    const verifiedRole = interaction.guild.roles.cache.get(settings.verified_role_id);
    if (!verifiedRole) {
      return interaction.reply({
        content: 'Role verifikasi tidak ditemukan di server ini.',
        ephemeral: true
      });
    }

    if (interaction.member.roles.cache.has(verifiedRole.id)) {
      return interaction.reply({
        content: 'Anda sudah terverifikasi sebelumnya!',
        ephemeral: true
      });
    }

    try {
      await interaction.member.roles.add(verifiedRole);
      return interaction.reply({
        embeds: [embeds.success('Verifikasi Berhasil!', `Selamat! Anda telah mendapatkan role <@&${verifiedRole.id}>. Selamat bergabung dan beraktivitas!`)],
        ephemeral: true
      });
    } catch (err) {
      return interaction.reply({
        content: `Gagal memberikan role verifikasi: ${err.message}`,
        ephemeral: true
      });
    }
  }
};

module.exports = welcomeService;
