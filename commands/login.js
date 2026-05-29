const { SlashCommandBuilder } = require('discord.js');
const { generateToken } = require('../utils/tokenGen');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('login')
    .setDescription('Logs you in to Hex'),
  async execute(interaction) {
    const tk = await generateToken(interaction.user.id);
    const result = `login to catalog by clicking [here](http://localhost:8000/?token=${tk})`;
    await interaction.reply({ content: result, ephemeral: true });

  }
};