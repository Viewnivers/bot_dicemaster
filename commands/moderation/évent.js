const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('évent')
		.setDescription('lien vers les différent événement disponnible'),
	async execute(interaction) {
		const exampleEmbed = {
			color: 0xcd1818,
			title: 'lien des événement disponnible :',
			description: '*Jeux de rôle annulé finalment*'
		};

		await interaction.reply({
			embeds: [exampleEmbed],
			components: [{
				type: 1,
				components: [
				
					{
						type: 2,
						style: 5,
						label: 'Dragon Ball Legend',
						url: 'https://discord.gg/8gNNEnG2?event=1121142290535170168',
						emoji: {
							name: '🔗'
						},
						disabled: true
					},

                    {
						type: 2,
						style: 5,
						label: 'Torneo Del Poder',
						url: 'https://discord.gg/NwaSksFd?event=1121141226905796628',
						emoji: {
							name: '🔗'
						}
					},

					{
						type: 2,
						style: 5,
						label: 'Jeux De Rôle | La Résilience',
						url: 'https://discord.com/events/1111252097913077902/1111540375593693194',
						emoji: {
							name: '❌'
						},
						disabled: true
						
					},
					
				]
			}]
		});
	},
};
