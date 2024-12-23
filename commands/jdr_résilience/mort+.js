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
    .setName('add-death')
    .setDescription('Ajoute une mort à l\'utilisateur spécifié')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('L\'utilisateur auquel ajouter une mort')
        .setRequired(true)),

  async execute(interaction) {
    // Vérification si l'utilisateur est un administrateur
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Seuls les administrateurs peuvent utiliser cette commande.');
    }

    // Récupération de l'utilisateur spécifié dans la commande
    const utilisateur = interaction.options.getUser('utilisateur');

    // Récupération de l'identifiant de l'utilisateur
    const userId = utilisateur.id;

    // Mise à jour du nombre de morts de l'utilisateur
    const updateQuery = `UPDATE deaths SET deathCount = deathCount + 1 WHERE user_id = '${userId}'`;

    // Exécution de la requête SQL pour mettre à jour le nombre de morts
    connection.query(updateQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la mise à jour du nombre de morts.');
      }

      // Si la requête s'est exécutée avec succès
      interaction.reply(`Le nombre de morts de ${utilisateur.username} a été mis à jour avec succès. Une mort ajoutée.`);
    });
  },
};
