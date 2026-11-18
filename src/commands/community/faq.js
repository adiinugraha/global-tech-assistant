const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faq')
    .setDescription('Menampilkan pertanyaan yang sering diajukan (FAQ) komunitas'),

  async execute(interaction) {
    const embed = embeds.base(
      '❓ Pertanyaan Umum (FAQ) - Network Intelligence',
      'Berikut beberapa jawaban untuk pertanyaan yang sering ditanyakan di server kami:'
    )
      .addFields(
        {
          name: '1. Bagaimana cara mendapatkan role komunitas?',
          value: 'Gunakan kanal role atau interaksi panel role di server kami untuk memilih peran minat seperti Jaringan, Pemrograman, atau Keamanan Siber.',
          inline: false
        },
        {
          name: '2. Bagaimana cara meminta bantuan teknis?',
          value: 'Buka tiket melalui panel bantuan dengan kategori **Technical Support** atau ajukan pertanyaan di kanal diskusi yang relevan.',
          inline: false
        },
        {
          name: '3. Bagaimana cara menaikkan level?',
          value: 'Aktiflah berdiskusi dan berbagi ilmu secara wajar. Sistem XP memiliki cooldown 60 detik untuk mencegah spam.',
          inline: false
        },
        {
          name: '4. Apa saja aturan utama server?',
          value: 'Gunakan perintah `/rules` untuk membaca panduan dan tata tertib lengkap server kami.',
          inline: false
        }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
