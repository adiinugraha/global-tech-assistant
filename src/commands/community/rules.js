const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Menampilkan tata tertib dan aturan resmi server'),

  async execute(interaction) {
    const embed = embeds.base(
      '📜 Aturan & Tata Tertib Server',
      'Demi kenyamanan dan produktivitas bersama, setiap anggota wajib mematuhi aturan berikut:'
    )
      .addFields(
        { name: '1. Saling Menghormati & Toleransi', value: 'Perlakukan semua anggota dengan sopan. Tidak ada ujaran kebencian, pelecehan, diskriminasi, atau flaming.', inline: false },
        { name: '2. Larangan Spam & Promosi Liar', value: 'Dilarang mengirim pesan berulang-ulang, mass mention, atau menyebarkan tautan undangan server Discord lain tanpa izin.', inline: false },
        { name: '3. Gunakan Kanal Sesuai Topik', value: 'Kirimkan pesan dan pertanyaan teknis di kanal yang telah disediakan sesuai kategorinya.', inline: false },
        { name: '4. Privasi & Keamanan Data', value: 'Jangan pernah membagikan password, token, atau informasi kredensial rahasia di kanal publik.', inline: false },
        { name: '5. Keputusan Moderator Bersifat Final', value: 'Patuhi arahan tim moderator. Laporkan pelanggaran dengan perintah `/report` atau `/ticket`.', inline: false }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
