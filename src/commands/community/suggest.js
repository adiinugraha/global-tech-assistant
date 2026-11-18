const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Mengirim ide atau saran perbaikan ke komunitas')
    .addStringOption(opt =>
      opt.setName('saran')
        .setDescription('Isi saran Anda')
        .setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('saran');
    const settings = db.getGuildSettings(interaction.guildId);

    if (!settings.suggestion_channel_id) {
      return interaction.reply({
        embeds: [embeds.error('Kanal Belum Disetel', 'Admin belum menyetel kanal saran (`suggestion_channel_id`) menggunakan `/config`.')],
        ephemeral: true
      });
    }

    const channel = await interaction.guild.channels.fetch(settings.suggestion_channel_id).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        embeds: [embeds.error('Kanal Tidak Ditemukan', 'Kanal saran yang ditentukan tidak valid atau tidak dapat diakses bot.')],
        ephemeral: true
      });
    }

    const embed = embeds.base(
      '💡 Saran Baru Komunitas',
      text
    )
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .addFields({ name: 'Status', value: '⏳ Dalam Peninjauan (Pending)', inline: true });

    // Initial buttons with 0 count
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_vote_up_temp')
        .setLabel('Upvote (0)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId('btn_vote_down_temp')
        .setLabel('Downvote (0)')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎')
    );

    const sentMessage = await channel.send({ embeds: [embed], components: [row] });

    // Store in database
    const result = db.run(
      'INSERT INTO suggestions (guild_id, user_id, message_id, content) VALUES (?, ?, ?, ?)',
      interaction.guildId,
      interaction.user.id,
      sentMessage.id,
      text
    );

    // Update buttons with real suggestion ID
    const suggestionId = result.lastInsertRowid;
    const realRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_vote_up_${suggestionId}`)
        .setLabel('Upvote (0)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId(`btn_vote_down_${suggestionId}`)
        .setLabel('Downvote (0)')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎')
    );

    await sentMessage.edit({ components: [realRow] });

    return interaction.reply({
      embeds: [embeds.success('Saran Terkirim!', `Saran Anda telah dipublikasikan ke <#${channel.id}>. Terima kasih!`)],
      ephemeral: true
    });
  }
};
