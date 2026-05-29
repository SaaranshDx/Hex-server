const { SlashCommandBuilder } = require('discord.js');
const { setcape } = require('../utils/setcape');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-cape')
    .setDescription('Lets you change your cape')
    .addStringOption(option =>
      option
        .setName('capeid')
        .setDescription('The cape ID to set')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
        const newCapeId = interaction.options.getString('capeid');

        if (newCapeId.toLowerCase() === "none" || newCapeId.toLowerCase() === "null") {
            await interaction.reply("capeid cannot be null. Use /remove-cosmetics to remove your cape."); 
        } else {
            const result = await setcape(interaction.user.id, newCapeId);
            await interaction.reply(result);
        }

    } catch (error) {
      console.error('Error executing set-cape command:', error);
      await interaction.reply('An error occurred while setting your cape. Please try again later.');
    }
  }
};