const { SlashCommandBuilder } = require('discord.js');
const { askAI } = require('../../services/aiService');
const db = require('../../database');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Bertanya seputar teknologi, koding, dan jaringan ke Global Tech Assistant AI')
    .addStringOption(opt =>
      opt.setName('pertanyaan')
        .setDescription('Pertanyaan Anda (maks 500 karakter)')
        .setMaxLength(500)
        .setRequired(true)
    ),

  async execute(interaction) {
    // 1. Check if AI module is disabled in guild settings
    if (interaction.guildId) {
      const settings = db.getGuildSettings(interaction.guildId);
      if (settings && settings.ai_enabled === 0) {
        return interaction.reply({
          embeds: [embeds.error('Modul Nonaktif', 'Modul AI sedang dinonaktifkan di server ini. Administrator dapat mengaktifkannya kembali menggunakan `/config toggle-module modul:ai_enabled status:True`.')],
          ephemeral: true
        });
      }
    }

    const question = interaction.options.getString('pertanyaan');
    await interaction.deferReply();

    // 2. Query AI Service
    const response = await askAI(question, interaction.user.id);

    if (!response.success) {
      return interaction.editReply({
        embeds: [embeds.error('Asisten AI', response.message)]
      });
    }

    // 3. Prevent Discord embed character limit overflow (max 4096)
    let replyText = response.reply;
    if (replyText.length > 4000) {
      replyText = replyText.slice(0, 3990) + '...\n\n*(Jawaban dipotong karena melebihi batas teks Discord)*';
    }

    const embed = embeds.base('🤖 Jawaban Global Tech Assistant AI', replyText)
      .setFooter({
        text: `Ditanyakan oleh ${interaction.user.tag} • Model: ${response.provider || 'GTA AI'}`
      });

    return interaction.editReply({ embeds: [embed] });
  }
};
