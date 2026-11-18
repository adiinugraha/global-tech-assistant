/**
 * Input Validation & Text Sanitization
 */

const DISCORD_INVITE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discord(?:app)?\.com\/invite)\/[a-zA-Z0-9_-]+/i;
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function containsDiscordInvite(text) {
  if (!text) return false;
  return DISCORD_INVITE_REGEX.test(text);
}

function containsLinks(text) {
  if (!text) return false;
  return URL_REGEX.test(text);
}

function countMentions(text) {
  if (!text) return 0;
  const userOrRoleMentions = (text.match(/<@&?[0-9]+>/g) || []).length;
  const everyoneMentions = (text.match(/@(everyone|here)/gi) || []).length;
  return userOrRoleMentions + everyoneMentions;
}

function containsBadWords(text, badWordsList = []) {
  if (!text || !badWordsList || badWordsList.length === 0) return false;
  const lower = text.toLowerCase();
  return badWordsList.some(word => {
    if (!word) return false;
    const cleanWord = word.trim().toLowerCase();
    // Word boundary match
    const regex = new RegExp(`\\b${cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(lower);
  });
}

function truncate(str, max = 100) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

module.exports = {
  containsDiscordInvite,
  containsLinks,
  countMentions,
  containsBadWords,
  truncate
};
