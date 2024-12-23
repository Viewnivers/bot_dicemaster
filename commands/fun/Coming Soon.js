const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('commingsoon')
		.setDescription('Bientôt disponible'),
	async execute(interaction) {
		const sentMessage = await interaction.reply('Petit coquin 😏 tu as voulus savoirs les nouveautés en avance🫠');
    }
};

