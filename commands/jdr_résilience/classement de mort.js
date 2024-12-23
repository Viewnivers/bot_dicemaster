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
    .setName('rank-death')
    .setDescription('Affiche le classement des utilisateurs en fonction de leur nombre de morts'),

  async execute(interaction) {
    // Création de la requête SQL pour récupérer les utilisateurs triés par nombre de morts décroissant à partir de la table deaths
    const selectQuery = 'SELECT username, deathCount FROM deaths ORDER BY deathCount DESC';

    // Exécution de la requête SQL
    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la récupération du classement.');
      }

      // Création du message pour afficher le classement avec les médailles et les émojis pour les numéros de place
      let message = 'Classement des utilisateurs en fonction du nombre de morts :\n\n';
      results.forEach((user, index) => {
        let place;
        if (index === 0) {
          place = ':first_place:';
        } else if (index === 1) {
          place = ':second_place:';
        } else if (index === 2) {
          place = ':third_place:';
        } else {
          const emojis = [':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];
          place = emojis[index - 3];
        }

        message += `${place} ${user.username} - Nombre de morts : ${user.deathCount}\n`;
      });

      // Envoie du message à l'utilisateur
      interaction.reply(message);
    });
  },
};
