const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fiche-perso')
		.setDescription('Fiche des personnages (JDR)'),
	async execute(interaction) {
		const exampleEmbed = {
			color: 0x0099ff,
			title: 'Fiche des personnages :',
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
						label: 'Orion Claw',
						url: 'https://docs.google.com/document/d/1yi1rN0llDPRK8vfKvYiA-V5DFFGpmw6MNbN_1235e0E/edit?usp=sharing',
						emoji: {
							name: '🔗'
						},
						
					},
					{
						type: 2,
						style: 5,
						label: 'Rasheed',
						url: 'https://docs.google.com/document/d/1qtNBv2aKBVFa90vVdqD6zozxB7QVcFC5awAPpYSWu8g/edit?usp=sharing',
						emoji: {
							name: '🔗'
						},
						disabled: false
					},
					{
						type: 2,
						style: 5,
						label: 'Patrick Ecrous',
						url: 'https://example.com',
						emoji: {
							name: '❌'
						},
						disabled: true
					}
				]
			}]
		});
	},
};
