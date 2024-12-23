const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Affiche les commandes principales disponibles'),
	async execute(interaction) {
		const exampleEmbed = {
			color: 0x9e0808 ,
			title: 'Voici les commandes qui sont disponibles : ',
			description: ('1. /help ( Pour afficher les commandes disponibles )\n'+
			'2. /helpjdr ( Affiche les commandes pour le jdr )\n'+
			'3. /ping ( Pour testé son ping )\n')
		};

		await interaction.reply({ embeds: [exampleEmbed] });
	},
};
