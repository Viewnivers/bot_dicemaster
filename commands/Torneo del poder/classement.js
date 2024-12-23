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
    .setName('classement')
    .setDescription('Affiche le classement des utilisateurs en fonction de leur argent'),

  async execute(interaction) {
    // Création de la requête SQL pour récupérer les utilisateurs triés par argent décroissant à partir de la table banks
    const selectQuery = 'SELECT username, balance FROM banks ORDER BY balance DESC';

    // Exécution de la requête SQL
    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la récupération du classement.');
      }

      // Création du message pour afficher le classement
      let message = 'Classement des utilisateurs :\n\n';
      results.forEach((user, index) => {
        message += `#${index + 1} - ${user.username}\nArgent : ${user.balance} $\n\n`;
      });

      // Envoie du message à l'utilisateur
      interaction.reply(message);
    });
  },
};
