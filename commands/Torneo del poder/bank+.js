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
    .setName('add-money')
    .setDescription('Ajoute de l\'argent à la banque d\'un joueur')
    .addUserOption(option =>
      option.setName('joueur')
        .setDescription('Le joueur auquel ajouter de l\'argent')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('montant')
        .setDescription('Le montant à ajouter à la banque')
        .setRequired(true)),

  async execute(interaction) {
    // Vérification si l'utilisateur est un administrateur
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    // Récupération des options de la commande
    const joueur = interaction.options.getUser('joueur');
    const montant = interaction.options.getInteger('montant');

    // Récupération de l'identifiant du joueur
    const joueurId = joueur.id;

    // Mise à jour de la banque du joueur avec le montant spécifié
    const updateQuery = `UPDATE banks SET balance = balance + ${montant} WHERE user_id = '${joueurId}'`;

    // Exécution de la requête SQL pour mettre à jour la banque
    connection.query(updateQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la mise à jour de la banque.');
      }

      // Si la requête s'est exécutée avec succès
      interaction.reply(`La banque de ${joueur.username} a été mise à jour avec succès. Montant ajouté : ${montant} $.`);
    });
  },
};
