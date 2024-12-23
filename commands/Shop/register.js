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
    .setName('register')
    .setDescription('Enregistrez-vous dans la base de données'),

  async execute(interaction) {
    // Récupération de l'identifiant de l'utilisateur
    const userId = interaction.user.id;

    // Vérification si l'utilisateur est déjà enregistré dans la table 'users'
    const checkUserQuery = `SELECT * FROM users WHERE id = '${userId}'`;
    const [existingUser] = await connection.query(checkUserQuery);

    if (existingUser.length !== 0) {
      // L'utilisateur est déjà enregistré
      await interaction.reply('Vous êtes déjà enregistré dans la base de données.');
      return;
    }

    // Ajout de l'utilisateur à la table 'users'
    const insertUserQuery = `INSERT INTO users (id) VALUES ('${userId}')`;
    await connection.query(insertUserQuery);

    // L'utilisateur a été ajouté avec succès
    await interaction.reply('Vous avez été enregistré dans la base de données.');
  },
};
