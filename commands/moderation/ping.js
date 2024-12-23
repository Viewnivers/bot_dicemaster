const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche ton Ping actuel'),
  async execute(interaction) {
    const startTime = Date.now();
    const exampleEmbed = {
		color: 0x000000,
		title: 'Calcul du Ping...',
    };

    const sentMessage = await interaction.reply({ embeds: [exampleEmbed], fetchReply: true });
    const endTime = Date.now();
    const ping = endTime - startTime;
		
    exampleEmbed.title = `Ton Ping est de : ${ping}ms`;
    await sentMessage.edit({ embeds: [exampleEmbed] });
  },
};
