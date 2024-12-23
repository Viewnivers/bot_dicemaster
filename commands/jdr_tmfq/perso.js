const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('perso')
		.setDescription('Fiche des personnages (JDR)'),
	async execute(interaction) {
		const exampleEmbed = {
			color: 0x0099ff,
			title: 'Fiche de vos personnages :',
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
						label: 'Shalltear',
						url: 'https://docs.google.com/document/d/1PwNB1LMaxv2qVTBI52FGVN2P9DHgT9DNA6ugbXAphVg/edit?usp=drive_link',
						emoji: {
							name: '🔗'
						},
						
					},

					{
						type: 2,
						style: 5,
						label: 'Ruby',
						url: 'https://docs.google.com/document/d/1OrWY6orVuyQ8labusA0rMqwpw1vkPlXh9jzCVyVOWP8/edit?usp=drive_link',
						emoji: {
							name: '🔗'
						},
						
					},
				
				]
			}]
		});
	},
};
