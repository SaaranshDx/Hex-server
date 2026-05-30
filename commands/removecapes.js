const { SlashCommandBuilder } = require('discord.js');
const { setcape } = require('../utils/setcape');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-cosmetics')
    .setDescription('Lets you remove you capes'),
  async execute(interaction) {
    const result = await setcape(interaction.user.id, "null");
    await interaction.reply({ content: result, ephemeral: true });

  }
}; 