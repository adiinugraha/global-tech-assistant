const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Melihat ramalan cuaca terkini di kota/lokasi tertentu')
    .addStringOption(opt =>
      opt.setName('kota')
        .setDescription('Nama kota atau lokasi (contoh: Jakarta, Bandung, Tokyo)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const city = interaction.options.getString('kota');
    await interaction.deferReply();

    try {
      // Using open-meteo geocoding & forecast (no API key required, reliable & free)
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=id&format=json`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return interaction.editReply({
          embeds: [embeds.error('Kota Tidak Ditemukan', `Tidak dapat menemukan informasi geolokasi untuk kota **${city}**.`)]
        });
      }

      const location = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m`);
      const weatherData = await weatherRes.json();
      const current = weatherData.current;

      const embed = embeds.base(`🌤️ Informasi Cuaca: ${location.name}, ${location.country || ''}`, null)
        .addFields(
          { name: '🌡️ Suhu Saat Ini', value: `${current.temperature_2m} °C`, inline: true },
          { name: '🌡️ Terasa Seperti', value: `${current.apparent_temperature} °C`, inline: true },
          { name: '💧 Kelembapan', value: `${current.relative_humidity_2m} %`, inline: true },
          { name: '💨 Kecepatan Angin', value: `${current.wind_speed_10m} km/h`, inline: true },
          { name: '🌧️ Curah Hujan', value: `${current.precipitation} mm`, inline: true },
          { name: '📍 Koordinat', value: `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`, inline: true }
        );

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply({
        embeds: [embeds.error('Gagal Memuat Cuaca', err.message)]
      });
    }
  }
};
