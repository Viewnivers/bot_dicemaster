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
    .setName('reset_paris')
    .setDescription('Réinitialise les paris (ADMIN ONLY)'),

  async execute(interaction) {
    // Vérification si l'utilisateur est un administrateur
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    // Vidage des tables paris et bank_paris
    const resetQueries = [
      `TRUNCATE TABLE paris`,
      `TRUNCATE TABLE bank_paris`
    ];

    connection.beginTransaction((err) => {
      if (err) {
        console.error('Erreur lors de la transaction SQL :', err);
        return interaction.reply('Une erreur est survenue lors de la réinitialisation.');
      }

      resetQueries.forEach((query, index) => {
        connection.query(query, (error, results) => {
          if (error) {
            return connection.rollback(() => {
              console.error('Erreur lors de l\'exécution de la requête SQL :', error);
              return interaction.reply('Une erreur est survenue lors de la réinitialisation.');
            });
          }

          if (index === resetQueries.length - 1) {
            connection.commit((commitErr) => {
              if (commitErr) {
                return connection.rollback(() => {
                  console.error('Erreur lors de la validation de la transaction SQL :', commitErr);
                  return interaction.reply('Une erreur est survenue lors de la réinitialisation.');
                });
              }

              interaction.reply('Les paris ont été réinitialisés avec succès.');
            });
          }
        });
      });
    });
  },
};
