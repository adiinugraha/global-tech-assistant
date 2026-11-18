/**
 * Database Schema Definition for Global Tech Assistant
 * Compatible with SQLite (Node.js DatabaseSync / better-sqlite3)
 */

const SCHEMA_QUERIES = [
  // 1. Server / Guild Settings
  `CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    prefix TEXT DEFAULT '!',
    language TEXT DEFAULT 'id',
    welcome_channel_id TEXT DEFAULT NULL,
    welcome_message TEXT DEFAULT NULL,
    goodbye_channel_id TEXT DEFAULT NULL,
    goodbye_message TEXT DEFAULT NULL,
    auto_role_id TEXT DEFAULT NULL,
    verified_role_id TEXT DEFAULT NULL,
    mod_role_id TEXT DEFAULT NULL,
    admin_role_id TEXT DEFAULT NULL,
    log_channel_id TEXT DEFAULT NULL,
    suggestion_channel_id TEXT DEFAULT NULL,
    report_channel_id TEXT DEFAULT NULL,
    ticket_category_id TEXT DEFAULT NULL,
    ticket_log_channel_id TEXT DEFAULT NULL,
    news_channel_id TEXT DEFAULT NULL,
    automod_enabled INTEGER DEFAULT 1,
    leveling_enabled INTEGER DEFAULT 1,
    ai_enabled INTEGER DEFAULT 1,
    rss_enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 2. Warnings
  `CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings(guild_id, user_id)`,

  // 3. Moderation Cases
  `CREATE TABLE IF NOT EXISTS moderation_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    action TEXT NOT NULL, -- WARN, TIMEOUT, UNTIMEOUT, KICK, BAN, UNBAN
    reason TEXT NOT NULL,
    duration INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_cases_guild_user ON moderation_cases(guild_id, user_id)`,

  // 4. Ticket System
  `CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    claimed_by TEXT DEFAULT NULL,
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'open', -- open, claimed, closed
    transcript TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME DEFAULT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tickets_guild_user ON tickets(guild_id, user_id)`,

  // 5. Leveling & XP
  `CREATE TABLE IF NOT EXISTS leveling (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    last_xp_at INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_leveling_guild_xp ON leveling(guild_id, xp DESC)`,

  // Level Rewards
  `CREATE TABLE IF NOT EXISTS level_rewards (
    guild_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    role_id TEXT NOT NULL,
    PRIMARY KEY (guild_id, level)
  )`,

  // Excluded channels for leveling
  `CREATE TABLE IF NOT EXISTS level_excluded_channels (
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    PRIMARY KEY (guild_id, channel_id)
  )`,

  // 6. Suggestions
  `CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message_id TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected, implemented
    upvotes TEXT DEFAULT '[]',   -- JSON array of user IDs
    downvotes TEXT DEFAULT '[]', -- JSON array of user IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 7. Events
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_timestamp INTEGER NOT NULL,
    attendees TEXT DEFAULT '[]', -- JSON array of user IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 8. RSS Feeds
  `CREATE TABLE IF NOT EXISTS rss_feeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    feed_url TEXT NOT NULL,
    feed_name TEXT NOT NULL,
    last_guid TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 9. Reminders
  `CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    remind_at INTEGER NOT NULL,
    is_completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(is_completed, remind_at)`,

  // 10. AFK Status
  `CREATE TABLE IF NOT EXISTS afk_status (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reason TEXT DEFAULT 'AFK',
    afk_at INTEGER NOT NULL,
    PRIMARY KEY (guild_id, user_id)
  )`,

  // 11. Reaction / Button Roles
  `CREATE TABLE IF NOT EXISTS reaction_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    custom_id TEXT NOT NULL,
    label TEXT NOT NULL,
    emoji TEXT DEFAULT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_reaction_roles_msg ON reaction_roles(message_id, custom_id)`,

  // 12. Auto Moderation Rules per Server
  `CREATE TABLE IF NOT EXISTS automod_rules (
    guild_id TEXT PRIMARY KEY,
    spam_enabled INTEGER DEFAULT 1,
    mass_mention_enabled INTEGER DEFAULT 1,
    invite_filter_enabled INTEGER DEFAULT 1,
    link_filter_enabled INTEGER DEFAULT 0,
    bad_words_enabled INTEGER DEFAULT 1,
    anti_raid_enabled INTEGER DEFAULT 1,
    spam_threshold INTEGER DEFAULT 5,
    mass_mention_threshold INTEGER DEFAULT 4,
    bad_words TEXT DEFAULT '[]', -- JSON array of strings
    trusted_roles TEXT DEFAULT '[]', -- JSON array of role IDs
    trusted_channels TEXT DEFAULT '[]' -- JSON array of channel IDs
  )`,

  // 13. Audit & Logs Record
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    executor_id TEXT DEFAULT NULL,
    target_id TEXT DEFAULT NULL,
    details TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

module.exports = { SCHEMA_QUERIES };
