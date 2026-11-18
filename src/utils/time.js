/**
 * Time and Duration Utilities
 */

/**
 * Parses a string duration (e.g., '10s', '15m', '2h', '1d', '1w') into milliseconds.
 * Returns null if invalid.
 */
function parseDuration(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return null;

  const match = durationStr.trim().toLowerCase().match(/^(\d+)\s*([smhdw])$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (isNaN(value) || value <= 0) return null;

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

/**
 * Formats duration in milliseconds into human-readable Indonesian text
 */
function formatHumanDuration(ms) {
  if (ms <= 0) return '0 detik';

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days} hari`);
  if (hours > 0) parts.push(`${hours} jam`);
  if (minutes > 0) parts.push(`${minutes} menit`);
  if (seconds > 0 && parts.length === 0) parts.push(`${seconds} detik`);

  return parts.join(' ');
}

/**
 * Formats a Date or timestamp into Discord dynamic timestamp tags
 * Formats: 'R' (relative: 2 minutes ago), 'F' (full: Monday, 1 January 2026 12:00)
 */
function discordTimestamp(dateOrMs, style = 'R') {
  const ts = Math.floor((typeof dateOrMs === 'number' ? dateOrMs : new Date(dateOrMs).getTime()) / 1000);
  return `<t:${ts}:${style}>`;
}

module.exports = {
  parseDuration,
  formatHumanDuration,
  discordTimestamp
};
