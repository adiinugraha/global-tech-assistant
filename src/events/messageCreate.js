const { Events } = require('discord.js');
const db = require('../database');
const automodService = require('../modules/automod/automodService');
const levelingService = require('../modules/leveling/levelingService');
const embeds = require('../utils/embeds');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    // 1. AutoMod Pipeline Check
    const intercepted = await automodService.handleMessage(message);
    if (intercepted) return; // Stop processing if message violated rules and was deleted

    // 2. AFK Pipeline
    const guildId = message.guild.id;
    const authorId = message.author.id;

    // Check if author was AFK -> Remove AFK status
    const authorAfk = db.get('SELECT * FROM afk_status WHERE guild_id = ? AND user_id = ?', guildId, authorId);
    if (authorAfk) {
      db.run('DELETE FROM afk_status WHERE guild_id = ? AND user_id = ?', guildId, authorId);
      const welcomeBackMsg = await message.reply({
        embeds: [embeds.info('Selamat Datang Kembali!', `Status AFK untuk <@${authorId}> telah dihapus.`)]
      }).catch(() => null);

      if (welcomeBackMsg) {
        setTimeout(() => welcomeBackMsg.delete().catch(() => null), 5000);
      }
    }

    // Check if message mentioned someone who is AFK
    if (message.mentions.users.size > 0) {
      for (const [mentionedId, user] of message.mentions.users) {
        if (mentionedId === authorId || user.bot) continue;
        const targetAfk = db.get('SELECT * FROM afk_status WHERE guild_id = ? AND user_id = ?', guildId, mentionedId);
        if (targetAfk) {
          await message.reply({
            embeds: [embeds.warning('Pengguna Sedang AFK', `<@${mentionedId}> sedang AFK: **"${targetAfk.reason}"** (<t:${targetAfk.afk_at}:R>)`)]
          }).catch(() => null);
          break; // Reply once per message
        }
      }
    }

    // 3. Leveling & XP Processing
    await levelingService.handleMessage(message);
  }
};
