const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Menampilkan avatar profil anggota dalam resolusi tinggi')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Pilih anggota (kosongkan untuk avatar Anda sendiri)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = embeds.base(`🖼️ Avatar: ${user.tag}`, `[Buka Gambar Penuh](${avatarUrl})`)
      .setImage(avatarUrl);

    return interaction.reply({ embeds: [embed] });
  }
};
