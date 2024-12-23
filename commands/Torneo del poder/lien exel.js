const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tournois')
		.setDescription('lien vers les exel pour parrié'),
	async execute(interaction) {
		const exampleEmbed = {
			color: 0xcd1818,
			title: 'Torneo del poder :',
			description: ''
		};

		await interaction.reply({
			embeds: [exampleEmbed],
			components: [{
				type: 1,
				components: [
					{
						type: 2,
						style: 5,
						label: 'Partie en cours',
						url: 'https://docs.google.com/spreadsheets/d/1MVWo8Orj3-V4zSc6UTxfpF9g_va5HXQTmcTWwFBmUxE/edit?usp=sharing',
						emoji: {
							name: '❌'
						},
						disabled: true
						
					},
					{
						type: 2,
						style: 5,
						label: 'Partie Disponible',
						url: 'https://docs.google.com/spreadsheets/d/1oRFeMZY5nrg1osa84LSbVFZub1zzEADOcMK9DqVCATQ/edit?usp=sharing',
						emoji: {
							name: '🔗'
						}
					},
					
				]
			}]
		});
	},
};
