const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');
const { parseDuration, discordTimestamp } = require('../../utils/time');
const { isModerator } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('Membuat pengumuman event komunitas dan tombol RSVP')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
    .addStringOption(opt =>
      opt.setName('judul')
        .setDescription('Nama atau judul event')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('deskripsi')
        .setDescription('Deskripsi detail event')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('waktu')
        .setDescription('Waktu mulai dari sekarang (contoh: 2h, 1d, 3d)')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya staf yang dapat membuat event.')], ephemeral: true });
    }

    const title = interaction.options.getString('judul');
    const desc = interaction.options.getString('deskripsi');
    const timeStr = interaction.options.getString('waktu');

    const durationMs = parseDuration(timeStr);
    if (!durationMs) {
      return interaction.reply({
        embeds: [embeds.error('Format Waktu Tidak Valid', 'Contoh format: `2h` (2 jam lagi), `1d` (1 hari lagi).')],
        ephemeral: true
      });
    }

    const eventTimestamp = Math.floor((Date.now() + durationMs) / 1000);

    // Save event in database
    const result = db.run(
      'INSERT INTO events (guild_id, channel_id, creator_id, title, description, event_timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      interaction.guildId,
      interaction.channelId,
      interaction.user.id,
      title,
      desc,
      eventTimestamp
    );

    const eventId = result.lastInsertRowid;

    const embed = embeds.base(
      `🎉 Event Komunitas: ${title}`,
      `${desc}\n\n` +
      `📅 **Waktu Pelaksanaan:** <t:${eventTimestamp}:F> (<t:${eventTimestamp}:R>)\n` +
      `👤 **Penyelenggara:** <@${interaction.user.id}>\n` +
      `👥 **Peserta Terdaftar:** 0 orang`
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_event_rsvp_${eventId}`)
        .setLabel('Daftar / Hadir (RSVP)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✋')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
