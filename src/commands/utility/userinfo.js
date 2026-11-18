const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { discordTimestamp } = require('../../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Menampilkan informasi akun anggota')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Pilih anggota (kosongkan untuk melihat akun Anda)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = embeds.base(`👤 Profil: ${user.tag}`, null)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 User ID', value: `\`${user.id}\``, inline: true },
        { name: '🏷️ Nama Pengguna', value: user.username, inline: true },
        { name: '🤖 Tipe Akun', value: user.bot ? 'Bot Aplikasi' : 'Pengguna Biasa', inline: true },
        { name: '📅 Akun Dibuat', value: `${discordTimestamp(user.createdAt, 'F')}\n(${discordTimestamp(user.createdAt, 'R')})`, inline: false }
      );

    if (member) {
      const rolesList = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .map(r => `<@&${r.id}>`)
        .slice(0, 15)
        .join(', ') || 'Tidak ada role khusus';

      embed.addFields(
        { name: '📥 Bergabung Server', value: `${discordTimestamp(member.joinedAt, 'F')}\n(${discordTimestamp(member.joinedAt, 'R')})`, inline: false },
        { name: '🛡️ Role Tertinggi', value: `<@&${member.roles.highest.id}>`, inline: true },
        { name: `🎭 Daftar Role (${member.roles.cache.size - 1})`, value: rolesList, inline: false }
      );
    }

    return interaction.reply({ embeds: [embed] });
  }
};
