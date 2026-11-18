const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { BOT_NAME, BOT_VERSION } = require('../../config/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Menampilkan direktori dan panduan seluruh perintah bot')
    .addStringOption(opt =>
      opt.setName('kategori')
        .setDescription('Pilih kategori perintah spesifik')
        .setRequired(false)
        .addChoices(
          { name: '🛡️ Moderation', value: 'moderation' },
          { name: '⚙️ AutoMod & Security', value: 'automod' },
          { name: '🛠️ Utility', value: 'utility' },
          { name: '💬 Community', value: 'community' },
          { name: '🎫 Ticket & Support', value: 'ticket' },
          { name: '⭐ Leveling & XP', value: 'leveling' },
          { name: '🤖 AI & News', value: 'ai_news' },
          { name: '🔧 Admin & Config', value: 'admin' }
        )
    ),

  async execute(interaction) {
    const category = interaction.options.getString('kategori');

    if (!category) {
      const mainEmbed = embeds.base(
        `📚 Direktori Perintah ${BOT_NAME} v${BOT_VERSION}`,
        'Gunakan `/help [kategori]` untuk melihat rincian perintah pada tiap kategori.\n\n' +
        '• 🛡️ **Moderation:** `/warn`, `/warnings`, `/timeout`, `/kick`, `/ban`, `/purge`, `/lock`, `/slowmode`, `/modlogs`\n' +
        '• ⚙️ **AutoMod & Anti-Raid:** `/automod`, `/lockdown`\n' +
        '• 🛠️ **Utility:** `/ping`, `/botinfo`, `/userinfo`, `/serverinfo`, `/avatar`, `/poll`, `/remind`, `/afk`, `/calculator`, `/translate`, `/weather`\n' +
        '• 💬 **Community:** `/suggest`, `/report`, `/feedback`, `/announce`, `/embed-builder`, `/faq`, `/rules`, `/resources`, `/event`\n' +
        '• 🎫 **Ticket & Support:** `/ticket-panel`, `/ticket`\n' +
        '• 🎭 **Auto Role:** `/autorole-panel`\n' +
        '• ⭐ **Leveling & XP:** `/rank`, `/leaderboard`, `/setxp`\n' +
        '• 🤖 **AI & News:** `/ask`, `/news`\n' +
        '• 🔧 **Admin & Config:** `/setup`, `/config`'
      );
      return interaction.reply({ embeds: [mainEmbed] });
    }

    const categoriesMap = {
      moderation: {
        title: '🛡️ Kategori Moderasi',
        desc: '`/warn` — Memberi peringatan\n`/warnings` — Riwayat peringatan\n`/clear-warnings` — Menghapus peringatan (Admin)\n`/timeout` & `/untimeout` — Membatasi interaksi anggota\n`/kick` — Mengeluarkan anggota\n`/ban` & `/unban` — Memblokir atau membuka blokir\n`/purge` — Menghapus pesan massal\n`/slowmode` — Jeda chat kanal\n`/lock` & `/unlock` — Kunci/buka kanal\n`/nick` — Ubah nickname anggota\n`/modlogs` — Riwayat kasus moderasi'
      },
      automod: {
        title: '⚙️ Auto Moderation & Anti-Raid',
        desc: '`/automod status` — Status filter proteksi aktif\n`/automod toggle` — Aktif/nonaktifkan filter spam, invite, link, mass mention\n`/automod add-word` & `remove-word` — Kelola daftar kata terlarang\n`/lockdown` — Mode darurat kunci seluruh server'
      },
      utility: {
        title: '🛠️ Kategori Utilitas',
        desc: '`/ping` — Latensi bot\n`/botinfo` — Spesifikasi & uptime sistem\n`/userinfo` — Info profil & akun\n`/serverinfo` — Statistik server\n`/roleinfo` & `/channelinfo` — Info role / kanal\n`/avatar` & `/banner` — Tampilan media pengguna\n`/poll` — Polling voting\n`/remind` — Pengingat otomatis\n`/afk` — Mode AFK\n`/timestamp` — Generator waktu Discord\n`/calculator` — Hitung matematika cepat\n`/translate` — Terjemah bahasa\n`/weather` — Info cuaca kota'
      },
      community: {
        title: '💬 Komunitas & Informasi',
        desc: '`/suggest` — Kirim ide saran dengan tombol voting\n`/report` — Laporkan pelanggaran ke moderator secara rahasia\n`/feedback` — Masukan untuk server\n`/announce` — Siarkan pengumuman resmi\n`/embed-builder` — Buat embed kustom\n`/faq` — Tanya jawab umum\n`/rules` — Aturan server\n`/resources` — Referensi belajar koding & jaringan\n`/event` — Informasi event dengan tombol RSVP'
      },
      ticket: {
        title: '🎫 Tiket & Bantuan',
        desc: '`/ticket-panel` — Pasang panel tiket interaktif\n`/ticket` — Buat tiket bantuan privat'
      },
      leveling: {
        title: '⭐ Leveling & XP',
        desc: '`/rank` — Kartu level & progress XP Anda\n`/leaderboard` — 10 anggota paling aktif\n`/setxp` — Pengaturan XP manual oleh Admin'
      },
      ai_news: {
        title: '🤖 AI Assistant & RSS News',
        desc: '`/ask` — Bertanya seputar teknologi ke AI GTA\n`/news list` — Daftar feed berita RSS\n`/news add` — Tambah sumber RSS baru\n`/news remove` — Hapus sumber RSS'
      },
      admin: {
        title: '🔧 Administrasi & Setup',
        desc: '`/setup` — Panduan setup cepat server\n`/config view` — Ringkasan konfigurasi server saat ini\n`/config channels` — Atur kanal Welcome, Log, Saran, Laporan\n`/config roles` — Atur Auto-Role, Verified, Mod, Admin\n`/config toggle-module` — Aktif/nonaktifkan modul'
      }
    };

    const selected = categoriesMap[category];
    const embed = embeds.base(selected.title, selected.desc);
    return interaction.reply({ embeds: [embed] });
  }
};
