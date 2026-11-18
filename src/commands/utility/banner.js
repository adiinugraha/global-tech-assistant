const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Menampilkan banner profil anggota jika tersedia')
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Pilih anggota (kosongkan untuk diri sendiri)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userOption = interaction.options.getUser('target') || interaction.user;
    // Fetch full user to load banner data
    const user = await interaction.client.users.fetch(userOption.id, { force: true });
    const bannerUrl = user.bannerURL({ dynamic: true, size: 1024 });

    if (!bannerUrl) {
      return interaction.reply({
        embeds: [embeds.info('Tidak Ada Banner', `<@${user.id}> tidak memiliki banner profil kustom.`)],
        ephemeral: true
      });
    }

    const embed = embeds.base(`🎨 Banner: ${user.tag}`, `[Buka Banner Penuh](${bannerUrl})`)
      .setImage(bannerUrl);

    return interaction.reply({ embeds: [embed] });
  }
};
