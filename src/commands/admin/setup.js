const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../database');
const { isAdmin } = require('../../utils/permissions');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Inisialisasi cepat dan panduan konfigurasi otomatis server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({ embeds: [embeds.error('Akses Ditolak', 'Hanya administrator yang dapat menjalankan setup.')], ephemeral: true });
    }

    const guild = interaction.guild;
    const settings = db.getGuildSettings(guild.id);

    const embed = embeds.base(
      '🚀 Panduan Setup Cepat Global Tech Assistant (GTA)',
      'Selamat datang di asisten multifungsi komunitas teknologi! Ikuti langkah-langkah ringkas berikut untuk mengaktifkan seluruh fitur bot secara optimal:'
    )
      .addFields(
        {
          name: '1️⃣ Atur Kanal Operasional',
          value: 'Jalankan `/config channels` untuk menyetel kanal Welcome, Goodbye, Audit Log, Saran, dan Laporan.',
          inline: false
        },
        {
          name: '2️⃣ Atur Role Moderator & Admin',
          value: 'Jalankan `/config roles` untuk menyetel role Moderator dan Administrator agar izin tindakan moderasi terkelola rapi.',
          inline: false
        },
        {
          name: '3️⃣ Pasang Panel Tiket & Bantuan',
          value: 'Kunjungi kanal bantuan yang Anda inginkan, lalu jalankan `/ticket-panel` untuk menampilkan menu tiket privat otomatis.',
          inline: false
        },
        {
          name: '4️⃣ Pasang Panel Pemilihan Role Mandiri',
          value: 'Jalankan `/autorole-panel` untuk memberikan tombol ambil role (misal minat koding, jaringan, atau notifikasi).',
          inline: false
        },
        {
          name: '5️⃣ Konfigurasi Keamanan & AutoMod',
          value: 'Periksa status filter proteksi dengan `/automod status` atau tambahkan kata terlarang dengan `/automod add-word`.',
          inline: false
        }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
