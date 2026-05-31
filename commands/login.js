const { SlashCommandBuilder } = require('discord.js');
const { generateToken } = require('../utils/tokenGen');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('login')
    .setDescription('Logs you in to Hex'),
  async execute(interaction) {
    const tk = await generateToken(interaction.user.id);
    const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:8000';
    const result = `login to catalog by clicking [here](${PUBLIC_URL}/?token=${tk})`;
    await interaction.reply({ content: result, ephemeral: true });

  }
};