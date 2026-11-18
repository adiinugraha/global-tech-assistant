/**
 * Global Tech Assistant (GTA) - System Constants & Default Configurations
 */

module.exports = {
  BOT_NAME: 'Global Tech Assistant',
  BOT_VERSION: '1.0.0',
  DEFAULT_COLOR: 0x00A8FF, // Vibrant Tech Blue
  COLORS: {
    PRIMARY: 0x00A8FF,
    SUCCESS: 0x00E676,
    WARNING: 0xFFB300,
    ERROR: 0xFF3D00,
    INFO: 0x2979FF,
    DARK: 0x1E1E24,
    PURPLE: 0x7C4DFF
  },
  FOOTER_TEXT: 'Global Tech Assistant • Network Intelligence',
  
  // Rate Limits & Defaults
  DEFAULTS: {
    PREFIX: '!',
    LANGUAGE: 'id',
    XP_COOLDOWN_SECONDS: 60,
    XP_PER_MESSAGE_MIN: 15,
    XP_PER_MESSAGE_MAX: 25,
    AI_COOLDOWN_SECONDS: 10,
    TICKET_LIMIT_PER_USER: 3,
    AUTOMOD_SPAM_MESSAGE_COUNT: 5,
    AUTOMOD_SPAM_SECONDS: 5,
    AUTOMOD_MASS_MENTION_LIMIT: 4,
    ANTI_RAID_JOIN_LIMIT: 8,
    ANTI_RAID_SECONDS: 10
  },

  // Ticket Categories
  TICKET_CATEGORIES: [
    { label: 'General Support', value: 'general', emoji: '💬', description: 'Bantuan umum komunitas dan informasi' },
    { label: 'Technical Support', value: 'technical', emoji: '💻', description: 'Kendala teknis jaringan, server, dan koding' },
    { label: 'Report Member / Content', value: 'report', emoji: '🛡️', description: 'Laporkan pelanggaran aturan atau anggota' },
    { label: 'Partnership / Sponsorship', value: 'partnership', emoji: '🤝', description: 'Kerjasama komunitas atau acara' },
    { label: 'Other Inquiries', value: 'other', emoji: '❓', description: 'Pertanyaan atau hal lainnya' }
  ],

  // Log Event Types
  AUDIT_TYPES: {
    MESSAGE_DELETE: 'MESSAGE_DELETE',
    MESSAGE_EDIT: 'MESSAGE_EDIT',
    MEMBER_JOIN: 'MEMBER_JOIN',
    MEMBER_LEAVE: 'MEMBER_LEAVE',
    MEMBER_ROLE_UPDATE: 'MEMBER_ROLE_UPDATE',
    MEMBER_NICK_UPDATE: 'MEMBER_NICK_UPDATE',
    MOD_ACTION: 'MOD_ACTION',
    TICKET_ACTION: 'TICKET_ACTION',
    CHANNEL_UPDATE: 'CHANNEL_UPDATE',
    VOICE_STATE: 'VOICE_STATE'
  }
};
