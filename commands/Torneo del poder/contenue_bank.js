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
    .setName('bank_balance')
    .setDescription('Affiche le solde de votre banque'),

  async execute(interaction) {
    const userId = interaction.user.id;

    // Récupération du solde de l'utilisateur depuis la base de données
    const getBalanceQuery = `SELECT balance FROM banks WHERE user_id = '${userId}'`;

    connection.query(getBalanceQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la récupération du solde.');
      }

      if (results.length === 0) {
        return interaction.reply('Vous n\'avez pas encore de compte bancaire.');
      }

      const balance = results[0].balance;
      interaction.reply(`Votre solde actuel est de ${balance} $.`);
    });
  },
};
