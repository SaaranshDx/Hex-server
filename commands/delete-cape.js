const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-cape')
    .setDescription('Deletes a cape from the server (Admin only)')
    .addStringOption((option) =>
      option
        .setName('capeid')
        .setDescription('The cape ID to delete')
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'You need administrator permission to use this command.', ephemeral: true });
    }

    const capeId = interaction.options.getString('capeid');
    const capesDir = path.join(__dirname, '..', 'assets', 'capes');
    const capeMetaDir = path.join(__dirname, '..', 'cape_meta');
    const rendersDir = path.join(__dirname, '..', 'assets', 'renders', 'capes');
    const userMetaDir = path.join(__dirname, '..', 'user_meta');

    const capePath = path.join(capesDir, `${capeId}.png`);

    if (!fs.existsSync(capePath)) {
      return interaction.reply({ content: `Cape with ID \`${capeId}\` not found.`, ephemeral: true });
    }

    const deleted = [];

    try {
      fs.unlinkSync(capePath);
      deleted.push(`\`assets/capes/${capeId}.png\``);
    } catch (err) {
      console.error(`Failed to delete cape texture:`, err);
    }

    const metaPath = path.join(capeMetaDir, `${capeId}.json`);
    if (fs.existsSync(metaPath)) {
      try {
        fs.unlinkSync(metaPath);
        deleted.push(`\`cape_meta/${capeId}.json\``);
      } catch (err) {
        console.error(`Failed to delete cape metadata:`, err);
      }
    }

    for (const ext of ['.webp', '.png']) {
      const renderPath = path.join(rendersDir, `${capeId}${ext}`);
      if (fs.existsSync(renderPath)) {
        try {
          fs.unlinkSync(renderPath);
          deleted.push(`\`assets/renders/capes/${capeId}${ext}\``);
        } catch (err) {
          console.error(`Failed to delete render:`, err);
        }
      }
    }

    if (fs.existsSync(userMetaDir)) {
      const userFiles = fs.readdirSync(userMetaDir).filter(f => f.endsWith('.json'));
      for (const file of userFiles) {
        const filePath = path.join(userMetaDir, file);
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (data.capeid === capeId) {
            data.capeid = 'null';
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          }
        } catch (err) {
          console.error(`Failed to update user ${file}:`, err);
        }
      }
    }

    if (deleted.length === 0) {
      return interaction.reply({ content: 'Failed to delete any files for that cape.', ephemeral: true });
    }

    await interaction.reply({
      content: `Successfully deleted cape \`${capeId}\` and removed:\n${deleted.join('\n')}\n*Any users with this cape equipped have been reset to no cape.*`,
      ephemeral: true,
    });
  }
};
