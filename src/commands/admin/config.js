const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Melihat dan mengubah konfigurasi modul server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('Melihat ringkasan seluruh pengaturan server saat ini')
    )
    .addSubcommand(sub =>
      sub.setName('channels')
        .setDescription('Mengatur kanal-kanal penting')
        .addChannelOption(opt => opt.setName('welcome').setDescription('Kanal sambutan anggota baru').setRequired(false))
        .addChannelOption(opt => opt.setName('goodbye').setDescription('Kanal perpisahan').setRequired(false))
        .addChannelOption(opt => opt.setName('log').setDescription('Kanal audit log dan moderasi').setRequired(false))
        .addChannelOption(opt => opt.setName('suggestion').setDescription('Kanal saran komunitas').setRequired(false))
        .addChannelOption(opt => opt.setName('report').setDescription('Kanal laporan anggota/rahasia').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('roles')
        .setDescription('Mengatur role-role operasional bot')
        .addRoleOption(opt => opt.setName('auto_role').setDescription('Role otomatis untuk anggota baru').setRequired(false))
        .addRoleOption(opt => opt.setName('verified_role').setDescription('Role anggota yang sudah terverifikasi').setRequired(false))
        .addRoleOption(opt => opt.setName('mod_role').setDescription('Role moderator server').setRequired(false))
        .addRoleOption(opt => opt.setName('admin_role').setDescription('Role administrator server').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('toggle-module')
        .setDescription('Mengaktifkan atau mematikan modul bot secara independen')
        .addStringOption(opt =>
          opt.setName('modul')
            .setDescription('Pilih modul')
            .setRequired(true)
            .addChoices(
              { name: 'Auto Moderation', value: 'automod_enabled' },
              { name: 'Leveling & XP System', value: 'leveling_enabled' },
              { name: 'AI Assistant (/ask)', value: 'ai_enabled' },
              { name: 'RSS News Feed', value: 'rss_enabled' }
            )
        )
        .addBooleanOption(opt =>
          opt.setName('status')
            .setDescription('True = Aktif, False = Nonaktif')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat mengubah konfigurasi.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const settings = db.getGuildSettings(interaction.guildId);

    if (sub === 'view') {
      const embed = embeds.base(`⚙️ Pengaturan Server: ${interaction.guild.name}`, null)
        .addFields(
          {
            name: '📁 Konfigurasi Kanal',
            value: `• **Welcome:** ${settings.welcome_channel_id ? `<#${settings.welcome_channel_id}>` : '*Belum disetel*'}\n` +
                   `• **Goodbye:** ${settings.goodbye_channel_id ? `<#${settings.goodbye_channel_id}>` : '*Belum disetel*'}\n` +
                   `• **Audit / Mod Log:** ${settings.log_channel_id ? `<#${settings.log_channel_id}>` : '*Belum disetel*'}\n` +
                   `• **Saran (Suggestion):** ${settings.suggestion_channel_id ? `<#${settings.suggestion_channel_id}>` : '*Belum disetel*'}\n` +
                   `• **Laporan (Report):** ${settings.report_channel_id ? `<#${settings.report_channel_id}>` : '*Belum disetel*'}`,
            inline: false
          },
          {
            name: '🛡️ Konfigurasi Role',
            value: `• **Auto Role:** ${settings.auto_role_id ? `<@&${settings.auto_role_id}>` : '*Belum disetel*'}\n` +
                   `• **Verified Role:** ${settings.verified_role_id ? `<@&${settings.verified_role_id}>` : '*Belum disetel*'}\n` +
                   `• **Mod Role:** ${settings.mod_role_id ? `<@&${settings.mod_role_id}>` : '*Belum disetel*'}\n` +
                   `• **Admin Role:** ${settings.admin_role_id ? `<@&${settings.admin_role_id}>` : '*Belum disetel*'}`,
            inline: false
          },
          {
            name: '⚡ Status Modul',
            value: `• **Auto Moderation:** ${settings.automod_enabled ? '✅ Aktif' : '❌ Nonaktif'}\n` +
                   `• **Leveling & XP:** ${settings.leveling_enabled ? '✅ Aktif' : '❌ Nonaktif'}\n` +
                   `• **AI Assistant:** ${settings.ai_enabled ? '✅ Aktif' : '❌ Nonaktif'}\n` +
                   `• **RSS News:** ${settings.rss_enabled ? '✅ Aktif' : '❌ Nonaktif'}`,
            inline: false
          }
        );

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'channels') {
      const updates = {};
      const welcome = interaction.options.getChannel('welcome');
      const goodbye = interaction.options.getChannel('goodbye');
      const log = interaction.options.getChannel('log');
      const suggestion = interaction.options.getChannel('suggestion');
      const report = interaction.options.getChannel('report');

      if (welcome) updates.welcome_channel_id = welcome.id;
      if (goodbye) updates.goodbye_channel_id = goodbye.id;
      if (log) updates.log_channel_id = log.id;
      if (suggestion) updates.suggestion_channel_id = suggestion.id;
      if (report) updates.report_channel_id = report.id;

      if (Object.keys(updates).length === 0) {
        return interaction.reply({ content: 'Tidak ada kanal yang diubah.', ephemeral: true });
      }

      db.updateGuildSettings(interaction.guildId, updates);
      return interaction.reply({
        embeds: [embeds.success('Kanal Diperbarui', 'Konfigurasi kanal server berhasil disimpan!')]
      });
    }

    if (sub === 'roles') {
      const updates = {};
      const autoRole = interaction.options.getRole('auto_role');
      const verifiedRole = interaction.options.getRole('verified_role');
      const modRole = interaction.options.getRole('mod_role');
      const adminRole = interaction.options.getRole('admin_role');

      if (autoRole) updates.auto_role_id = autoRole.id;
      if (verifiedRole) updates.verified_role_id = verifiedRole.id;
      if (modRole) updates.mod_role_id = modRole.id;
      if (adminRole) updates.admin_role_id = adminRole.id;

      if (Object.keys(updates).length === 0) {
        return interaction.reply({ content: 'Tidak ada role yang diubah.', ephemeral: true });
      }

      db.updateGuildSettings(interaction.guildId, updates);
      return interaction.reply({
        embeds: [embeds.success('Role Diperbarui', 'Konfigurasi role operasional bot berhasil disimpan!')]
      });
    }

    if (sub === 'toggle-module') {
      const mod = interaction.options.getString('modul');
      const status = interaction.options.getBoolean('status');

      db.updateGuildSettings(interaction.guildId, { [mod]: status ? 1 : 0 });
      return interaction.reply({
        embeds: [embeds.success('Status Modul Diperbarui', `Modul **${mod}** kini telah diatur ke: **${status ? 'AKTIF' : 'NONAKTIF'}**.`)]
      });
    }
  }
};
