const { SlashCommandBuilder } = require('discord.js');
const { unregisterUser } = require('../utils/unregister');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Unregisters you from Hex'),
  async execute(interaction) {
    const result = await unregisterUser(interaction.user.id);
    await interaction.reply(result);

  }
};