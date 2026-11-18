const { Events } = require('discord.js');
const { handleInteraction } = require('../handlers/interactionHandler');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    await handleInteraction(interaction);
  }
};
