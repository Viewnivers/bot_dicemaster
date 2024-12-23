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
    .setName('add_money_paris')
    .setDescription('Ajoute de l\'argent à un utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('L\'utilisateur auquel ajouter de l\'argent')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription('Le montant à ajouter')
        .setRequired(true)),

  async execute(interaction) {
    // Vérification si l'utilisateur est un administrateur
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    // Récupération des options de la commande
    const utilisateur = interaction.options.getUser('utilisateur');
    const montant = interaction.options.getInteger('montant');

    // Récupération de l'identifiant de l'utilisateur
    const utilisateurId = utilisateur.id;

    // Vérification si l'utilisateur existe dans la base de données
    const checkUserQuery = `SELECT * FROM banks WHERE user_id = '${utilisateurId}'`;

    connection.query(checkUserQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la vérification de l\'utilisateur.');
      }

      if (results.length === 0) {
        // Si l'utilisateur n'existe pas, on le crée avec le montant spécifié
        const insertUserQuery = `INSERT INTO banks (user_id, balance) VALUES ('${utilisateurId}', ${montant})`;
        connection.query(insertUserQuery, (error, results) => {
          if (error) {
            console.error('Erreur lors de l\'exécution de la requête SQL :', error);
            return interaction.reply('Une erreur est survenue lors de l\'ajout de l\'utilisateur.');
          }

          interaction.reply(`${montant} $ ont été ajoutés à ${utilisateur.username}.`);
        });
      } else {
        // Si l'utilisateur existe, on met à jour son solde
        const updateQuery = `UPDATE banks SET balance = balance + ${montant} WHERE user_id = '${utilisateurId}'`;
        connection.query(updateQuery, (error, results) => {
          if (error) {
            console.error('Erreur lors de l\'exécution de la requête SQL :', error);
            return interaction.reply('Une erreur est survenue lors de la mise à jour du solde.');
          }

          interaction.reply(`${montant} $ ont été ajoutés à ${utilisateur.username}.`);
        });
      }
    });
  },
};
