const { SlashCommandBuilder } = require('discord.js');
const { generateCapePreview } = require('../utils/capePreviews');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generate-preview')
    .setDescription('Generate a rendered preview for a cape texture')
    .addAttachmentOption(option =>
      option
        .setName('cape')
        .setDescription('The cape texture PNG to render')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const attachment = interaction.options.getAttachment('cape');

      if (!attachment.contentType || attachment.contentType !== 'image/png') {
        return interaction.editReply({ content: 'Only PNG files are supported.' });
      }

      const response = await fetch(attachment.url);
      if (!response.ok) {
        return interaction.editReply({ content: 'Failed to download the uploaded file.' });
      }

      const arrayBuffer = await response.arrayBuffer();
      const capeBuffer = Buffer.from(arrayBuffer);
      const previewBuffer = await generateCapePreview(capeBuffer);

      await interaction.editReply({
        files: [{
          attachment: previewBuffer,
          name: 'cape-preview.png'
        }]
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      await interaction.editReply({ content: `Failed to generate preview: ${error.message}` });
    }
  }
};
