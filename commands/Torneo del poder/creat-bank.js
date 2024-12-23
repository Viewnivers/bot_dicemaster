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
    .setName('createbank')
    .setDescription('Crée une nouvelle banque'),

  async execute(interaction) {
    // Récupération de l'identifiant et de l'username de l'utilisateur
    const userId = interaction.user.id;
    const username = interaction.user.username;

    // Création de la requête SQL pour insérer l'entrée dans la table 'banks'
    const insertQuery = `INSERT INTO banks (user_id, username, balance) VALUES ('${userId}', '${username}', 0)`;

    // Exécution de la requête SQL
    connection.query(insertQuery, (error) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la création de la banque.');
      }

      // Envoie d'une réponse à l'utilisateur
      interaction.reply(`Banque créée pour ${username}.`);
    });
  },
};
