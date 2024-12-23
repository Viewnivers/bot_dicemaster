const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Déconnecte le bot du salon vocal'),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			await interaction.reply('Vous devez être dans un salon vocal pour utiliser cette commande.');
			return;
		}

		await voiceChannel.leave();
		await interaction.reply('Le bot a été déconnecté du salon vocal.');
	},
};
