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
    .setName('death')
    .setDescription('Affiche le nombre de morts de l\'utilisateur'),

  async execute(interaction) {
    // Récupération de l'identifiant de l'utilisateur
    const userId = interaction.user.id;

    // Création de la requête SQL pour récupérer le nombre de morts de l'utilisateur depuis la table deaths
    const selectQuery = `SELECT username, deathCount FROM deaths WHERE user_id = '${userId}'`;

    // Exécution de la requête SQL
    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la récupération du nombre de morts.');
      }

      if (results.length === 0) {
        return interaction.reply('Aucun utilisateur trouvé.');
      }

      const userData = results[0]; // On suppose qu'il n'y a qu'un seul enregistrement par utilisateur dans la table deaths
      const username = userData.username;
      const deathCount = userData.deathCount;

      // Envoie du nombre de morts à l'utilisateur sur le serveur, mais uniquement visible par lui
      interaction.reply(`${username}, vous avez ${deathCount} morts.`);
    });
  },
};
