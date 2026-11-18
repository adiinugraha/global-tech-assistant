/**
 * RSS Feed Polling Service
 * Checks feeds periodically and sends fresh tech news to configured channels.
 */

const Parser = require('rss-parser');
const db = require('../database');
const logger = require('../utils/logger');
const embeds = require('../utils/embeds');
const { COLORS } = require('../config/constants');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'GlobalTechAssistant-Bot/1.0' }
});

async function checkFeeds(client) {
  try {
    const feeds = db.all('SELECT * FROM rss_feeds');
    if (!feeds || feeds.length === 0) return;

    for (const feed of feeds) {
      try {
        const guildSettings = db.getGuildSettings(feed.guild_id);
        if (!guildSettings.rss_enabled) continue;

        const channel = await client.channels.fetch(feed.channel_id).catch(() => null);
        if (!channel || !channel.isTextBased()) continue;

        const parsed = await parser.parseURL(feed.feed_url);
        if (!parsed.items || parsed.items.length === 0) continue;

        const latestItem = parsed.items[0];
        const itemGuid = latestItem.id || latestItem.guid || latestItem.link;

        if (itemGuid && itemGuid !== feed.last_guid) {
          // New article found!
          const embed = embeds.base(
            `📰 [${feed.feed_name}] ${latestItem.title}`,
            latestItem.contentSnippet ? latestItem.contentSnippet.slice(0, 350) + '...' : 'Klik tautan di bawah untuk membaca artikel selengkapnya.',
            COLORS.PRIMARY
          )
            .setURL(latestItem.link)
            .addFields(
              { name: 'Sumber', value: feed.feed_name, inline: true },
              { name: 'Tanggal', value: latestItem.pubDate || new Date().toLocaleDateString(), inline: true }
            );

          await channel.send({ embeds: [embed] });

          // Update last seen GUID
          db.run('UPDATE rss_feeds SET last_guid = ? WHERE id = ?', itemGuid, feed.id);
        }
      } catch (err) {
        logger.warn(`Error processing feed ${feed.feed_name} (${feed.feed_url}):`, err.message);
      }
    }
  } catch (err) {
    logger.error('RSS checkFeeds error:', err);
  }
}

function startRssScheduler(client, intervalMs = 15 * 60 * 1000) {
  logger.info('Starting RSS Feed polling service (Interval: 15 mins)...');
  // Initial check
  checkFeeds(client);
  // Periodic check
  return setInterval(() => checkFeeds(client), intervalMs);
}

module.exports = {
  checkFeeds,
  startRssScheduler
};
