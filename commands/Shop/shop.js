const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');

// Configuration de la base de données
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "DiceMaster"
};

// Création de la connexion à la base de données
const connection = mysql.createConnection(dbConfig);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Affiche le shop avec les articles disponibles'),

  async execute(interaction) {
    try {
      // Création de la requête SQL pour récupérer les articles du shop
      const selectShopQuery = `SELECT * FROM shop_items`;

      // Exécution de la requête SQL pour récupérer les articles du shop
      connection.query(selectShopQuery, (error, results) => {
        if (error) {
          console.error('Erreur lors de l\'exécution de la requête SQL pour récupérer les articles du shop :', error);
          return interaction.reply('Une erreur s\'est produite lors de la récupération des articles du shop. Veuillez réessayer ultérieurement.');
        }

        if (results.length === 0) {
          // Il n'y a aucun article dans le shop
          return interaction.reply('Le shop est actuellement vide.');
        }

        // Créer un message embed pour afficher les articles du shop
        const shopEmbed = {
          title: 'Boutique',
          description: 'Liste des articles disponibles :\n'+
          '*(/buy pour acheter l\'article)*',
          fields: [],
        };

        // Ajouter les articles à l'embed
        for (const item of results) {
          shopEmbed.fields.push({
            name: item.name,
            value: `Prix : ${item.price} $`,
          });
        }

        // Envoyer l'embed dans le canal où la commande a été utilisée
        interaction.reply({ embeds: [shopEmbed] });
      });
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête SQL pour récupérer les articles du shop :', error);
      interaction.reply('Une erreur s\'est produite lors de la récupération des articles du shop. Veuillez réessayer ultérieurement.');
    }
  },
};
