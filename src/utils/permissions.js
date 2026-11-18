/**
 * Permission & Role Hierarchy Checker
 * Enforces security, bot permission validation, and role hierarchy constraints.
 */

const { PermissionsBitField } = require('discord.js');
const db = require('../database');

/**
 * Check if the executing member has Moderator privileges in the guild
 */
function isModerator(member) {
  if (!member || !member.guild) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return true;
  if (member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return true;

  const settings = db.getGuildSettings(member.guild.id);
  if (settings.admin_role_id && member.roles.cache.has(settings.admin_role_id)) return true;
  if (settings.mod_role_id && member.roles.cache.has(settings.mod_role_id)) return true;

  return false;
}

/**
 * Check if the executing member has Administrator privileges in the guild
 */
function isAdmin(member) {
  if (!member || !member.guild) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;

  const settings = db.getGuildSettings(member.guild.id);
  if (settings.admin_role_id && member.roles.cache.has(settings.admin_role_id)) return true;

  return false;
}

/**
 * Check if moderator can punish the target based on Role Hierarchy
 */
function canModerateTarget(moderatorMember, targetMember) {
  if (!moderatorMember || !targetMember) return true;
  if (moderatorMember.id === targetMember.id) {
    return { can: false, reason: 'Anda tidak dapat memoderasi diri sendiri.' };
  }
  if (targetMember.id === targetMember.guild.ownerId) {
    return { can: false, reason: 'Anda tidak dapat memoderasi Pemilik Server (Guild Owner).' };
  }
  if (moderatorMember.id !== moderatorMember.guild.ownerId) {
    if (moderatorMember.roles.highest.position <= targetMember.roles.highest.position) {
      return { can: false, reason: 'Role target setara atau lebih tinggi dari role Anda dalam hierarki.' };
    }
  }

  // Check bot hierarchy as well
  const botMember = targetMember.guild.members.me;
  if (botMember && botMember.roles.highest.position <= targetMember.roles.highest.position) {
    return { can: false, reason: 'Role target setara atau lebih tinggi dari role Bot GTA dalam hierarki.' };
  }

  return { can: true };
}

/**
 * Check if bot has specific permissions in guild/channel
 */
function checkBotPermissions(channel, permissionsArray) {
  const botMember = channel.guild.members.me;
  if (!botMember) return false;
  const channelPerms = channel.permissionsFor(botMember);
  if (!channelPerms) return false;

  for (const perm of permissionsArray) {
    if (!channelPerms.has(perm)) {
      return { has: false, missing: perm };
    }
  }
  return { has: true };
}

module.exports = {
  isModerator,
  isAdmin,
  canModerateTarget,
  checkBotPermissions
};
