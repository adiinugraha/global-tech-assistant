const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole-panel')
    .setDescription('Membuat panel tombol pemilihan role mandiri')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(opt =>
      opt.setName('role')
        .setDescription('Role yang dapat diambil anggota')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('label')
        .setDescription('Teks label pada tombol')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('deskripsi')
        .setDescription('Deskripsi penjelasan role')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('emoji')
        .setDescription('Emoji untuk tombol (opsional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat membuat panel role.')], ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const label = interaction.options.getString('label');
    const desc = interaction.options.getString('deskripsi') || `Klik tombol di bawah untuk mengambil atau melepas role @${role.name}.`;
    const emoji = interaction.options.getString('emoji');

    // Role hierarchy check
    if (interaction.guild.members.me.roles.highest.position <= role.position) {
      return interaction.reply({
        embeds: [embeds.error('Hierarki Role Kurang', 'Role tersebut memiliki posisi setara atau lebih tinggi dari bot GTA. Pindahkan role bot ke atas terlebih dahulu.')],
        ephemeral: true
      });
    }

    const customId = `btn_autorole_${role.id}`;

    const embed = embeds.base(`🎭 Pilih Role: @${role.name}`, desc)
      .setColor(role.color || 0x00A8FF);

    const btn = new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Primary);

    if (emoji) btn.setEmoji(emoji);

    const row = new ActionRowBuilder().addComponents(btn);

    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

    // Save to database allowlist
    db.run(
      `INSERT INTO reaction_roles (guild_id, message_id, channel_id, role_id, custom_id, label, emoji)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      interaction.guildId,
      msg.id,
      interaction.channelId,
      role.id,
      customId,
      label,
      emoji || null
    );

    return interaction.reply({
      embeds: [embeds.success('Panel Role Dibuat', `Panel role untuk <@&${role.id}> berhasil dipasang di kanal ini.`)],
      ephemeral: true
    });
  }
};
