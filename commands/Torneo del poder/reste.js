const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');

// Configuration de la base de données
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Mot de passe de ta base de données
  database: "DiceMaster" // Nom de ta base de données
};

// Création de la connexion à la base de données
const connection = mysql.createConnection(dbConfig);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Réinitialise la base de données des paris'),

  async execute(interaction) {
    // Réinitialisation de la table des paris (à adapter selon ta structure de base de données)
    const resetParisQuery = `TRUNCATE TABLE paris`;
    // Réinitialisation de la table des votes (à adapter selon ta structure de base de données)
    const resetVotesQuery = `TRUNCATE TABLE bank_paris`;

    connection.query(resetParisQuery, (error) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL pour réinitialiser les paris :', error);
        return interaction.reply('Une erreur est survenue lors de la réinitialisation des paris.');
      }

      connection.query(resetVotesQuery, (error) => {
        if (error) {
          console.error('Erreur lors de l\'exécution de la requête SQL pour réinitialiser les votes :', error);
          return interaction.reply('Une erreur est survenue lors de la réinitialisation des votes.');
        }

        interaction.reply('Les données des paris ont été réinitialisées avec succès.');
      });
    });
  },
};
