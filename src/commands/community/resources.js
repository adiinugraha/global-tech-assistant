const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resources')
    .setDescription('Dokumentasi, panduan belajar, dan referensi teknologi terpercaya'),

  async execute(interaction) {
    const embed = embeds.base(
      '📚 Sumber Belajar & Referensi Teknologi',
      'Kumpulan referensi terkurasi untuk memperdalam kemampuan teknis Anda:'
    )
      .addFields(
        {
          name: '🌐 Computer Networking & Sysadmin',
          value: '• [MDN Web Docs (HTTP & Web)](https://developer.mozilla.org/)\n• [Linux Journey](https://linuxjourney.com/)\n• [Professor Messer Network+](https://www.professormesser.com/)',
          inline: false
        },
        {
          name: '💻 Pemrograman & Pengembangan',
          value: '• [roadmap.sh (Developer Roadmaps)](https://roadmap.sh/)\n• [freeCodeCamp](https://www.freecodecamp.org/)\n• [JavaScript.info](https://javascript.info/)',
          inline: false
        },
        {
          name: '🛡️ Keamanan Siber & Cloud',
          value: '• [OverTheWire Wargames](https://overthewire.org/)\n• [TryHackMe](https://tryhackme.com/)\n• [AWS & Cloud Architecture Center](https://aws.amazon.com/architecture/)',
          inline: false
        }
      );

    return interaction.reply({ embeds: [embed] });
  }
};
