const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Mengirim pengumuman resmi ke kanal tertentu')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('kanal')
        .setDescription('Kanal tujuan pengumuman')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('judul')
        .setDescription('Judul pengumuman')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('konten')
        .setDescription('Isi pesan pengumuman')
        .setRequired(true)
    )
    .addBooleanOption(opt =>
      opt.setName('mention_everyone')
        .setDescription('Sebutkan @everyone?')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya staf yang dapat membuat pengumuman.')], ephemeral: true });
    }

    const channel = interaction.options.getChannel('kanal');
    const title = interaction.options.getString('judul');
    const content = interaction.options.getString('konten');
    const mentionEveryone = interaction.options.getBoolean('mention_everyone') || false;

    if (!channel.isTextBased()) {
      return interaction.reply({ embeds: [embeds.error('Gagal', 'Kanal tujuan harus berupa kanal teks.')], ephemeral: true });
    }

    const embed = embeds.base(`📢 ${title}`, content)
      .setFooter({ text: `Diumumkan oleh ${interaction.user.tag}` });

    await channel.send({
      content: mentionEveryone ? '@everyone' : null,
      embeds: [embed]
    });

    return interaction.reply({
      embeds: [embeds.success('Pengumuman Terkirim', `Pengumuman berhasil disiarkan ke <#${channel.id}>.`)],
      ephemeral: true
    });
  }
};
