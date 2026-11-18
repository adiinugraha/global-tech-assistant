const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Mode darurat penguncian atau pembukaan seluruh kanal teks server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(opt =>
      opt.setName('aktif')
        .setDescription('True untuk mengunci semua kanal, False untuk membuka kembali')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat menjalankan lockdown.')], ephemeral: true });
    }

    const activate = interaction.options.getBoolean('aktif');
    await interaction.deferReply();

    const guild = interaction.guild;
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);

    let count = 0;
    for (const [, channel] of textChannels) {
      try {
        await channel.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: activate ? false : null
        }, { reason: `Emergency lockdown by ${interaction.user.tag}` });
        count++;
      } catch (e) {
        logger.warn(`Failed to update channel ${channel.name} during lockdown:`, e.message);
      }
    }

    if (activate) {
      return interaction.editReply({
        embeds: [embeds.error(
          '🚨 SERVER DALAM KEADAAN LOCKDOWN DARURAT 🚨',
          `Sebanyak **${count} kanal teks** telah dikunci. Anggota tanpa izin khusus tidak dapat mengirim pesan sampai lockdown dicabut.`
        )]
      });
    } else {
      return interaction.editReply({
        embeds: [embeds.success(
          '✅ LOCKDOWN DICABUT',
          `Sebanyak **${count} kanal teks** telah dibuka kembali. Aktivitas chat normal dapat dilanjutkan.`
        )]
      });
    }
  }
};
