/**
 * Reminder Background Service
 * Dispatches due reminders to channels or user DMs.
 */

const db = require('../database');
const logger = require('../utils/logger');
const embeds = require('../utils/embeds');

async function processDueReminders(client) {
  try {
    const now = Date.now();
    const dueReminders = db.all(
      'SELECT * FROM reminders WHERE is_completed = 0 AND remind_at <= ?',
      now
    );

    for (const reminder of dueReminders) {
      try {
        const channel = await client.channels.fetch(reminder.channel_id).catch(() => null);
        const user = await client.users.fetch(reminder.user_id).catch(() => null);

        const embed = embeds.info(
          '⏰ Pengingat / Reminder!',
          `<@${reminder.user_id}>, berikut pengingat yang Anda minta:\n\n**"${reminder.message}"**`
        );

        if (channel && channel.isTextBased()) {
          await channel.send({ content: `<@${reminder.user_id}>`, embeds: [embed] });
        } else if (user) {
          await user.send({ embeds: [embed] }).catch(() => null);
        }

        // Mark completed
        db.run('UPDATE reminders SET is_completed = 1 WHERE id = ?', reminder.id);
      } catch (err) {
        logger.warn(`Failed to dispatch reminder #${reminder.id}:`, err.message);
        // Mark as completed to prevent infinite loops
        db.run('UPDATE reminders SET is_completed = 1 WHERE id = ?', reminder.id);
      }
    }
  } catch (err) {
    logger.error('Error processing due reminders:', err);
  }
}

function startReminderScheduler(client, intervalMs = 20 * 1000) {
  logger.info('Starting Reminder scheduler service (Interval: 20s)...');
  return setInterval(() => processDueReminders(client), intervalMs);
}

module.exports = {
  processDueReminders,
  startReminderScheduler
};
