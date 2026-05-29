const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const setpermission = require('../utils/setpermission');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-permission')
    .setDescription('lets you change the permission level for a user')
            .addStringOption((option) =>
            option
                .setName('ign')
                .setDescription('Your Minecraft username')
                .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('permission')
                    .setDescription('The permission level to set')
                    .setRequired(true)
                    .addChoices(
                    { name: 'Admin', value: 'Admin' },
                    { name: 'Partner', value: 'Partner' },
                    { name: 'User', value: 'User' },
                    { name: 'Banned', value: 'Banned' }
                )

            ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'You need administrator permission to use this command.', ephemeral: true });
    }

    const ign = interaction.options.getString('ign');
    const permission = interaction.options.getString('permission');
    const result = await setpermission(ign, permission);
    await interaction.reply(result);

  }
}; 