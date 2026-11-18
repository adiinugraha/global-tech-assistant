const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Pengaturan sistem proteksi Auto Moderation')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Melihat status aturan AutoMod yang aktif di server ini')
    )
    .addSubcommand(sub =>
      sub.setName('toggle')
        .setDescription('Mengaktifkan atau menonaktifkan filter tertentu')
        .addStringOption(opt =>
          opt.setName('fitur')
            .setDescription('Pilih filter')
            .setRequired(true)
            .addChoices(
              { name: 'Anti-Spam Kecepatan Pesan', value: 'spam_enabled' },
              { name: 'Filter Mention Massal', value: 'mass_mention_enabled' },
              { name: 'Filter Undangan Discord', value: 'invite_filter_enabled' },
              { name: 'Filter Tautan Luar (Link)', value: 'link_filter_enabled' },
              { name: 'Filter Kata Terlarang (Bad Words)', value: 'bad_words_enabled' },
              { name: 'Deteksi Anti-Raid Mass Join', value: 'anti_raid_enabled' }
            )
        )
        .addBooleanOption(opt =>
          opt.setName('aktif')
            .setDescription('Status aktif?')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('add-word')
        .setDescription('Menambahkan kata ke daftar kata terlarang')
        .addStringOption(opt =>
          opt.setName('kata')
            .setDescription('Kata atau frasa yang ingin dilarang')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove-word')
        .setDescription('Menghapus kata dari daftar kata terlarang')
        .addStringOption(opt =>
          opt.setName('kata')
            .setDescription('Kata yang ingin dihapus')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat mengatur AutoMod.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const rules = db.getAutomodRules(interaction.guildId);

    if (sub === 'status') {
      const embed = embeds.base('🛡️ Konfigurasi Auto Moderation & Anti-Raid', null)
        .addFields(
          { name: '⚡ Anti-Spam Velocity', value: rules.spam_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
          { name: '📢 Mass Mention Filter', value: rules.mass_mention_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
          { name: '🔗 Discord Invite Filter', value: rules.invite_filter_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
          { name: '🌐 External Link Filter', value: rules.link_filter_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
          { name: '🤬 Bad Words Filter', value: rules.bad_words_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
          { name: '🚨 Anti-Raid Detector', value: rules.anti_raid_enabled ? '✅ Aktif' : '❌ Nonaktif', inline: true },
          { name: `📝 Daftar Kata Dilarang (${rules.bad_words.length})`, value: rules.bad_words.length > 0 ? rules.bad_words.join(', ') : '*Belum ada kata terdaftar*', inline: false }
        );
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'toggle') {
      const feature = interaction.options.getString('fitur');
      const active = interaction.options.getBoolean('aktif');

      db.updateAutomodRules(interaction.guildId, { [feature]: active ? 1 : 0 });

      return interaction.reply({
        embeds: [embeds.success('Pengaturan Disimpan', `Fitur **${feature}** kini disetel ke: **${active ? 'AKTIF' : 'NONAKTIF'}**.`)]
      });
    }

    if (sub === 'add-word') {
      const word = interaction.options.getString('kata').trim().toLowerCase();
      const list = [...rules.bad_words];
      if (!list.includes(word)) {
        list.push(word);
        db.updateAutomodRules(interaction.guildId, { bad_words: list });
      }

      return interaction.reply({
        embeds: [embeds.success('Kata Ditambahkan', `Kata **"${word}"** telah ditambahkan ke filter kata terlarang.`)]
      });
    }

    if (sub === 'remove-word') {
      const word = interaction.options.getString('kata').trim().toLowerCase();
      const list = rules.bad_words.filter(w => w !== word);
      db.updateAutomodRules(interaction.guildId, { bad_words: list });

      return interaction.reply({
        embeds: [embeds.success('Kata Dihapus', `Kata **"${word}"** telah dihapus dari daftar kata terlarang.`)]
      });
    }
  }
};
