/**
 * Database Manager for Global Tech Assistant
 * Uses Node.js native DatabaseSync (or better-sqlite3) with statement caching.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { SCHEMA_QUERIES } = require('./schema');
const logger = require('../utils/logger');

let db = null;
const statementCache = new Map();

function getDbPath() {
  const customPath = process.env.DATABASE_PATH || './data/gta_bot.sqlite';
  const resolved = path.resolve(process.cwd(), customPath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return resolved;
}

function initDatabase(inMemory = false) {
  if (db) return db;

  const dbLocation = inMemory ? ':memory:' : getDbPath();
  logger.info(`Initializing SQLite database at: ${dbLocation}`);

  db = new DatabaseSync(dbLocation);
  
  // Enable WAL mode for performance and concurrency if file-based
  if (!inMemory) {
    try {
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA foreign_keys = ON;');
    } catch (e) {
      logger.warn('Failed to set PRAGMA journal_mode or foreign_keys:', e.message);
    }
  }

  // Execute schema definitions
  for (const query of SCHEMA_QUERIES) {
    db.exec(query);
  }

  logger.info('Database schema verified & initialized successfully.');
  return db;
}

function getDatabase() {
  if (!db) {
    initDatabase();
  }
  return db;
}

function getStatement(sql) {
  const database = getDatabase();
  let stmt = statementCache.get(sql);
  if (!stmt) {
    stmt = database.prepare(sql);
    statementCache.set(sql, stmt);
  }
  return stmt;
}

const dbManager = {
  initDatabase,
  getDatabase,

  // Run an INSERT, UPDATE, or DELETE query
  run(sql, ...params) {
    const stmt = getStatement(sql);
    return stmt.run(...params);
  },

  // Get a single row
  get(sql, ...params) {
    const stmt = getStatement(sql);
    return stmt.get(...params);
  },

  // Get all rows
  all(sql, ...params) {
    const stmt = getStatement(sql);
    return stmt.all(...params);
  },

  // Execute raw script
  exec(sql) {
    return getDatabase().exec(sql);
  },

  // Guild Settings Helper
  getGuildSettings(guildId) {
    let settings = dbManager.get('SELECT * FROM guild_settings WHERE guild_id = ?', guildId);
    if (!settings) {
      dbManager.run(
        `INSERT INTO guild_settings (guild_id) VALUES (?)`,
        guildId
      );
      settings = dbManager.get('SELECT * FROM guild_settings WHERE guild_id = ?', guildId);
    }
    return settings;
  },

  updateGuildSettings(guildId, updates) {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);
    values.push(guildId);

    dbManager.run(
      `UPDATE guild_settings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE guild_id = ?`,
      ...values
    );
  },

  // Automod Rules Helper
  getAutomodRules(guildId) {
    let rules = dbManager.get('SELECT * FROM automod_rules WHERE guild_id = ?', guildId);
    if (!rules) {
      dbManager.run('INSERT INTO automod_rules (guild_id) VALUES (?)', guildId);
      rules = dbManager.get('SELECT * FROM automod_rules WHERE guild_id = ?', guildId);
    }
    return {
      ...rules,
      bad_words: JSON.parse(rules.bad_words || '[]'),
      trusted_roles: JSON.parse(rules.trusted_roles || '[]'),
      trusted_channels: JSON.parse(rules.trusted_channels || '[]')
    };
  },

  updateAutomodRules(guildId, updates) {
    const prepared = { ...updates };
    if (prepared.bad_words && typeof prepared.bad_words !== 'string') {
      prepared.bad_words = JSON.stringify(prepared.bad_words);
    }
    if (prepared.trusted_roles && typeof prepared.trusted_roles !== 'string') {
      prepared.trusted_roles = JSON.stringify(prepared.trusted_roles);
    }
    if (prepared.trusted_channels && typeof prepared.trusted_channels !== 'string') {
      prepared.trusted_channels = JSON.stringify(prepared.trusted_channels);
    }

    const keys = Object.keys(prepared);
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => prepared[k]);
    values.push(guildId);

    dbManager.run(
      `UPDATE automod_rules SET ${setClause} WHERE guild_id = ?`,
      ...values
    );
  }
};

module.exports = dbManager;
