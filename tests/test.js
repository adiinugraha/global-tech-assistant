/**
 * Comprehensive Automated Test Suite for Global Tech Assistant
 * Tests Database, Utilities, Leveling, Commands Integrity, and Sanitizers.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('\n========================================');
console.log('🧪 RUNNING GLOBAL TECH ASSISTANT TESTS');
console.log('========================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   Error: ${err.message}`);
    failedTests++;
  }
}

// 1. Test Database In-Memory Initialization & CRUD
runTest('Database in-memory initialization and schema generation', () => {
  const db = require('../src/database');
  db.initDatabase(true); // use in-memory database
  assert.ok(db.getDatabase(), 'Database instance should be initialized');

  // Insert & Read guild settings
  const testGuildId = '123456789012345678';
  const settings = db.getGuildSettings(testGuildId);
  assert.strictEqual(settings.guild_id, testGuildId, 'Guild ID should match');
  assert.strictEqual(settings.language, 'id', 'Default language should be id');

  // Update guild settings
  db.updateGuildSettings(testGuildId, {
    welcome_channel_id: '999888777',
    automod_enabled: 0
  });

  const updatedSettings = db.getGuildSettings(testGuildId);
  assert.strictEqual(updatedSettings.welcome_channel_id, '999888777');
  assert.strictEqual(updatedSettings.automod_enabled, 0);
});

// 2. Test Automod Rules CRUD
runTest('Automod rules retrieval and updates', () => {
  const db = require('../src/database');
  const testGuildId = '123456789012345678';

  const rules = db.getAutomodRules(testGuildId);
  assert.ok(Array.isArray(rules.bad_words), 'bad_words should be an array');
  assert.strictEqual(rules.spam_enabled, 1);

  db.updateAutomodRules(testGuildId, {
    bad_words: ['spamword', 'toxicphrase'],
    spam_threshold: 7
  });

  const updatedRules = db.getAutomodRules(testGuildId);
  assert.strictEqual(updatedRules.bad_words.length, 2);
  assert.ok(updatedRules.bad_words.includes('spamword'));
  assert.strictEqual(updatedRules.spam_threshold, 7);
});

// 3. Test Time Utilities
runTest('Time parser and formatter utilities', () => {
  const { parseDuration, formatHumanDuration, discordTimestamp } = require('../src/utils/time');

  assert.strictEqual(parseDuration('10s'), 10000);
  assert.strictEqual(parseDuration('15m'), 15 * 60 * 1000);
  assert.strictEqual(parseDuration('2h'), 2 * 60 * 60 * 1000);
  assert.strictEqual(parseDuration('1d'), 24 * 60 * 60 * 1000);
  assert.strictEqual(parseDuration('invalid'), null);

  assert.strictEqual(formatHumanDuration(60000), '1 menit');
  assert.strictEqual(formatHumanDuration(3600000 * 2 + 1800000), '2 jam 30 menit');

  const ts = discordTimestamp(1700000000000, 'R');
  assert.ok(ts.startsWith('<t:1700000000:R>'));
});

// 4. Test Text Sanitizer & Filters
runTest('Text sanitization, regex filters, and bad words detector', () => {
  const {
    containsDiscordInvite,
    containsLinks,
    countMentions,
    containsBadWords
  } = require('../src/utils/sanitizer');

  assert.ok(containsDiscordInvite('Yuk join discord.gg/network-intel'), 'Should detect discord.gg');
  assert.ok(containsDiscordInvite('https://discord.com/invite/xyz123'), 'Should detect discord.com/invite');
  assert.ok(!containsDiscordInvite('https://google.com'), 'Google is not a discord invite');

  assert.ok(containsLinks('Kunjungi https://example.com sekarang'), 'Should detect link');
  assert.ok(!containsLinks('Halo kawan apa kabar'), 'Plain text has no link');

  assert.strictEqual(countMentions('Halo <@123> dan <@&456> serta @everyone'), 3);
  assert.strictEqual(countMentions('Pesan biasa tanpa mention'), 0);

  const badWords = ['kasar', 'anjing', 'bodoh'];
  assert.ok(containsBadWords('Kamu kasar sekali', badWords));
  assert.ok(!containsBadWords('Saya sedang belajar koding', badWords));
});

// 5. Test Leveling Curve Calculations
runTest('Leveling XP math and level progression', () => {
  const levelingService = require('../src/modules/leveling/levelingService');

  const level0 = levelingService.getLevelFromTotalXp(0);
  assert.strictEqual(level0, 0);

  const neededForLevel0 = levelingService.getXpForLevel(0);
  assert.strictEqual(neededForLevel0, 100);

  // If user has 105 XP, they should be Level 1
  const level1 = levelingService.getLevelFromTotalXp(105);
  assert.strictEqual(level1, 1);
});

// 6. Test All Slash Commands Integrity
runTest('Slash commands integrity and registration structure', () => {
  const commandsPath = path.join(__dirname, '../src/commands');
  let commandCount = 0;

  function verifyDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        verifyDir(full);
      } else if (file.endsWith('.js')) {
        const cmd = require(full);
        assert.ok(cmd.data, `${file} must export data`);
        assert.ok(cmd.data.name, `${file} command must have a name`);
        assert.ok(cmd.data.description, `${file} command must have a description`);
        assert.strictEqual(typeof cmd.execute, 'function', `${file} must export execute function`);
        commandCount++;
      }
    }
  }

  verifyDir(commandsPath);
  console.log(`   Verified ${commandCount} slash commands successfully.`);
  assert.ok(commandCount >= 20, 'At least 20 commands must be registered');
});

// 7. Test All Gateway Events Integrity
runTest('Gateway events export and structure', () => {
  const eventsPath = path.join(__dirname, '../src/events');
  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  let eventCount = 0;

  for (const file of files) {
    const evt = require(path.join(eventsPath, file));
    assert.ok(evt.name, `${file} must export event name`);
    assert.strictEqual(typeof evt.execute, 'function', `${file} must export execute function`);
    eventCount++;
  }

  console.log(`   Verified ${eventCount} gateway events.`);
  assert.ok(eventCount >= 7, 'At least 7 event handlers must be registered');
});

console.log('\n========================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
}
