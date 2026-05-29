const { SlashCommandBuilder } = require('discord.js');
const { registerUser } = require('../utils/register');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register your Minecraft account')
        .addStringOption((option) =>
            option
                .setName('ign')
                .setDescription('Your Minecraft username')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('account_type')
                .setDescription('Cracked or Microsoft account')
                .setRequired(true)
                .addChoices(
                    { name: 'Cracked', value: 'cracked' },
                    { name: 'Microsoft', value: 'microsoft' }
                )
            ),    
        async execute(interaction) {
                const result = await registerUser(interaction.user.id, interaction.options.getString('ign'), interaction.options.getString('account_type'));
                await interaction.reply(result);
            }
    }