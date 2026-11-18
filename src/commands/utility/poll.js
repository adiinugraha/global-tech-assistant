const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Membuat polling interaktif sederhana')
    .addStringOption(opt =>
      opt.setName('pertanyaan')
        .setDescription('Topik polling atau pertanyaan')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('opsi_1')
        .setDescription('Pilihan jawaban 1')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('opsi_2')
        .setDescription('Pilihan jawaban 2')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('opsi_3')
        .setDescription('Pilihan jawaban 3 (opsional)')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('opsi_4')
        .setDescription('Pilihan jawaban 4 (opsional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('pertanyaan');
    const opt1 = interaction.options.getString('opsi_1');
    const opt2 = interaction.options.getString('opsi_2');
    const opt3 = interaction.options.getString('opsi_3');
    const opt4 = interaction.options.getString('opsi_4');

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    const options = [opt1, opt2, opt3, opt4].filter(Boolean);

    let desc = `**${question}**\n\n`;
    options.forEach((opt, idx) => {
      desc += `${emojis[idx]} ${opt}\n`;
    });

    const embed = embeds.base('📊 Polling Komunitas', desc)
      .setFooter({ text: `Polling dimulai oleh ${interaction.user.tag}` });

    const pollMsg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await pollMsg.react(emojis[i]).catch(() => null);
    }
  }
};
