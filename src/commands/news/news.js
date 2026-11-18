const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 8000 });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Kelola integrasi feed berita teknologi (RSS Feed)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Melihat daftar feed RSS yang aktif di server ini')
    )
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Menambahkan sumber feed RSS baru')
        .addStringOption(opt =>
          opt.setName('nama')
            .setDescription('Nama sumber (contoh: Hacker News, Ars Technica)')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('url')
            .setDescription('Tautan URL RSS Feed valid (XML/RSS)')
            .setRequired(true)
        )
        .addChannelOption(opt =>
          opt.setName('kanal')
            .setDescription('Kanal tujuan pengiriman berita')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Menghapus feed RSS')
        .addIntegerOption(opt =>
          opt.setName('id')
            .setDescription('ID Feed (lihat dari /news list)')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat mengelola feed berita.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const feeds = db.all('SELECT * FROM rss_feeds WHERE guild_id = ?', interaction.guildId);
      if (feeds.length === 0) {
        return interaction.reply({
          embeds: [embeds.info('Belum Ada Feed', 'Server ini belum memiliki sumber feed RSS berita.')],
          ephemeral: true
        });
      }

      const fields = feeds.map(f => ({
        name: `ID #${f.id} • ${f.feed_name}`,
        value: `**Kanal:** <#${f.channel_id}>\n**URL:** \`${f.feed_url}\``,
        inline: false
      }));

      const embed = embeds.base('📰 Daftar Feed RSS Aktif', null).addFields(fields);
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'add') {
      const name = interaction.options.getString('nama');
      const url = interaction.options.getString('url');
      const channel = interaction.options.getChannel('kanal');

      await interaction.deferReply();

      // Test parsing the RSS feed first
      try {
        const parsed = await parser.parseURL(url);
        if (!parsed || !parsed.title) throw new Error('Format feed tidak valid.');

        db.run(
          'INSERT INTO rss_feeds (guild_id, channel_id, feed_url, feed_name) VALUES (?, ?, ?, ?)',
          interaction.guildId,
          channel.id,
          url,
          name
        );

        return interaction.editReply({
          embeds: [embeds.success('Feed Berhasil Ditambahkan', `Sumber berita **${name}** telah terhubung ke kanal <#${channel.id}>.`)]
        });
      } catch (err) {
        return interaction.editReply({
          embeds: [embeds.error('Gagal Memverifikasi Feed', `URL RSS tidak dapat diurai: ${err.message}`)]
        });
      }
    }

    if (sub === 'remove') {
      const id = interaction.options.getInteger('id');
      const existing = db.get('SELECT * FROM rss_feeds WHERE id = ? AND guild_id = ?', id, interaction.guildId);

      if (!existing) {
        return interaction.reply({
          embeds: [embeds.error('Tidak Ditemukan', `Feed dengan ID #${id} tidak ditemukan.`)],
          ephemeral: true
        });
      }

      db.run('DELETE FROM rss_feeds WHERE id = ?', id);

      return interaction.reply({
        embeds: [embeds.success('Feed Dihapus', `Feed RSS **${existing.feed_name}** telah dihentikan.`)]
      });
    }
  }
};
