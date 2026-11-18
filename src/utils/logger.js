/**
 * Structured Logger for Global Tech Assistant
 * Supports console formatting with timestamps and secret masking.
 */

const fs = require('fs');
const path = require('path');

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS.info;

// Mask secrets like Discord Token, API keys, etc.
function maskSensitive(text) {
  if (typeof text !== 'string') return text;
  const token = process.env.DISCORD_TOKEN;
  const gemini = process.env.GEMINI_API_KEY;
  const openai = process.env.OPENAI_API_KEY;
  let masked = text;
  if (token && token.length > 5) masked = masked.replaceAll(token, '[REDACTED_DISCORD_TOKEN]');
  if (gemini && gemini.length > 5) masked = masked.replaceAll(gemini, '[REDACTED_GEMINI_KEY]');
  if (openai && openai.length > 5) masked = masked.replaceAll(openai, '[REDACTED_OPENAI_KEY]');
  return masked;
}

function formatMessage(level, message, ...meta) {
  const timestamp = new Date().toISOString();
  let details = '';
  if (meta.length > 0) {
    details = ' ' + meta.map(m => (m instanceof Error ? m.stack : typeof m === 'object' ? JSON.stringify(m) : m)).join(' ');
  }
  const raw = `[${timestamp}] [${level.toUpperCase()}] ${message}${details}`;
  return maskSensitive(raw);
}

const logger = {
  debug: (message, ...meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.debug) {
      console.debug('\x1b[90m' + formatMessage('debug', message, ...meta) + '\x1b[0m');
    }
  },
  info: (message, ...meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.info) {
      console.log('\x1b[36m' + formatMessage('info', message, ...meta) + '\x1b[0m');
    }
  },
  warn: (message, ...meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.warn) {
      console.warn('\x1b[33m' + formatMessage('warn', message, ...meta) + '\x1b[0m');
    }
  },
  error: (message, ...meta) => {
    if (CURRENT_LEVEL <= LOG_LEVELS.error) {
      console.error('\x1b[31m' + formatMessage('error', message, ...meta) + '\x1b[0m');
    }
  }
};

module.exports = logger;
