const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modService = require('../../modules/moderation/modService');
const { isModerator } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Menghapus sejumlah pesan dalam kanal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('jumlah')
        .setDescription('Jumlah pesan yang ingin dihapus (1 - 100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption(opt =>
      opt.setName('target')
        .setDescription('Hanya hapus pesan dari pengguna tertentu (opsional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Anda tidak memiliki izin.')], ephemeral: true });
    }

    const amount = interaction.options.getInteger('jumlah');
    const targetUser = interaction.options.getUser('target');

    await interaction.deferReply({ ephemeral: true });

    try {
      const deletedCount = await modService.purge(interaction.channel, amount, interaction.user, targetUser);
      return interaction.editReply({
        embeds: [embeds.success('Pembersihan Berhasil', `Berhasil menghapus **${deletedCount}** pesan${targetUser ? ` dari <@${targetUser.id}>` : ''}.`)]
      });
    } catch (err) {
      return interaction.editReply({ embeds: [embeds.error('Gagal Menghapus Pesan', err.message)] });
    }
  }
};
