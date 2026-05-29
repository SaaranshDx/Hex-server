const { SlashCommandBuilder } = require('discord.js');
const { getApiUrl } = require('../utils/api');

const MAX_FILE_SIZE_BYTES = 4_500_000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Upload a file to GhostDrop')
    .addAttachmentOption((option) =>
      option
        .setName('file')
        .setDescription('The file to upload')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('slug')
        .setDescription('Optional custom slug')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('password')
        .setDescription('Optional password to protect the file')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const attachment = interaction.options.getAttachment('file');
    const slug = interaction.options.getString('slug');
    const password = interaction.options.getString('password');

    if (attachment.size > MAX_FILE_SIZE_BYTES) {
      await interaction.editReply('❌ GhostDrop only accepts files up to about 4.5 MB.');
      return;
    }

    try {
      const fileResponse = await fetch(attachment.url);

      if (!fileResponse.ok) {
        await interaction.editReply('❌ Failed to read the uploaded attachment from Discord.');
        return;
      }

      const fileBuffer = await fileResponse.arrayBuffer();
      const formData = new FormData();
      const blob = new Blob([fileBuffer], {
        type: attachment.contentType || 'application/octet-stream',
      });

      formData.append('file', blob, attachment.name);
      if (slug) formData.append('slug', slug);
      if (password) formData.append('password', password);

      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/upload/`, {
        method: 'POST',
        body: formData,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.status === 409) {
        await interaction.editReply('❌ That slug is already in use.');
        return;
      }

      if (response.status === 413) {
        await interaction.editReply('❌ GhostDrop rejected that file as too large.');
        return;
      }

      if (!response.ok) {
        const detail = payload?.detail || payload?.error || 'Something went wrong.';
        await interaction.editReply(`❌ ${detail}`);
        return;
      }

      const fileId = payload.id;
      const publicUrl = new URL(`/${fileId}/`, `https://link.ghostdrop.qzz.io/`).toString();
      const downloadUrl = new URL(`/files/${fileId}`, `https://link.ghostdrop.qzz.io/`).toString();

      await interaction.editReply(
        `✅ Uploaded **${payload.original_name}**\n` +
        `🆔 ID: \`${fileId}\`\n` +
        `⏳ Expires in: ${payload.expires_in_hours} hours\n` +
        `🔒 Password protected: ${password ? 'Yes' : 'No'}\n` +
        `🔗 Share: ${publicUrl}\n` +
        `📥 Direct download: ${downloadUrl}`
      );
    } catch (error) {
      await interaction.editReply('❌ Failed to upload that file to GhostDrop.');
    }
  },
};
