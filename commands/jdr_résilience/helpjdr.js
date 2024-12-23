const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('helpjdr')
		.setDescription('Affiche les commandes du Jeu de Rôle disponibles (JDR)'),
	async execute(interaction) {
		const exampleEmbed = {
			color: 0x9e0808 ,
			title: 'Voici les commandes qui sont disponibles pour le jdr : ',
			description: ('1. /programmation ( Affiche la prochaîne session programmée pour le Jeux De Rôle)\n'+
			'2. /fiche-perso ( Affiche les fiches des personnages )\n3. /fiche-perso ( Fiche des personnages )\n4. /death ( affiche ton nombre de mort )\n5. /rank-death ( Affiche le classement des utilisateurs en fonction de leur nombre de morts )')
			
		};

		await interaction.reply({ embeds: [exampleEmbed] });
	},
};
