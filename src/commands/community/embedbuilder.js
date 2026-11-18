const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed-builder')
    .setDescription('Membuat pesan embed kustom')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('judul')
        .setDescription('Judul embed')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('deskripsi')
        .setDescription('Isi deskripsi embed')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('warna')
        .setDescription('Kode hex warna (contoh: #00A8FF atau #FF5500)')
        .setRequired(false)
    )
    .addChannelOption(opt =>
      opt.setName('kanal')
        .setDescription('Kanal target (opsional, default kanal saat ini)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Izin tidak mencukupi.')], ephemeral: true });
    }

    const title = interaction.options.getString('judul');
    const desc = interaction.options.getString('deskripsi');
    const colorHex = interaction.options.getString('warna');
    const targetChannel = interaction.options.getChannel('kanal') || interaction.channel;

    let color = 0x00A8FF;
    if (colorHex && /^#?[0-9A-Fa-f]{6}$/.test(colorHex)) {
      color = parseInt(colorHex.replace('#', ''), 16);
    }

    const embed = embeds.base(title, desc, color);

    await targetChannel.send({ embeds: [embed] });

    return interaction.reply({
      embeds: [embeds.success('Embed Berhasil Dikirim', `Embed telah dipublikasikan di <#${targetChannel.id}>.`)],
      ephemeral: true
    });
  }
};
