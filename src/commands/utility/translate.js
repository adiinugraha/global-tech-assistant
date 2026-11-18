const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Menerjemahkan teks antar bahasa')
    .addStringOption(opt =>
      opt.setName('teks')
        .setDescription('Teks yang ingin diterjemahkan')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('target_bahasa')
        .setDescription('Kode bahasa tujuan (contoh: en, id, ja, de)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('teks');
    const targetLang = interaction.options.getString('target_bahasa') || 'id';

    await interaction.deferReply();

    try {
      // Using legitimate free public translation endpoint (MyMemory API)
      const encoded = encodeURIComponent(text);
      const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=autodetect|${targetLang}`;

      const res = await fetch(url, { headers: { 'User-Agent': 'GlobalTechAssistant-Bot/1.0' } });
      if (!res.ok) throw new Error('API terjemahan tidak merespons');

      const data = await res.json();
      const translation = data.responseData?.translatedText;

      if (!translation) throw new Error('Gagal mendapatkan hasil terjemahan');

      const embed = embeds.base('🌐 Hasil Terjemahan', null)
        .addFields(
          { name: 'Teks Asli', value: text.slice(0, 1024), inline: false },
          { name: `Terjemahan (${targetLang.toUpperCase()})`, value: translation.slice(0, 1024), inline: false }
        );

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [embeds.error('Gagal Menerjemahkan', `Terjadi kendala pada layanan penerjemah: ${err.message}`)]
      });
    }
  }
};
