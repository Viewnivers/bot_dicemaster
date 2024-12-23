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
    .setName('ajoutxp')
    .setDescription('Ajoute de l\'XP à un joueur')
    .addUserOption(option => option.setName('joueur').setDescription('Le joueur à qui ajouter de l\'XP').setRequired(true))
    .addIntegerOption(option => option.setName('xp').setDescription('Le montant d\'XP à ajouter').setRequired(true)),
  async execute(interaction) {
    const joueur = interaction.options.getUser('joueur');
    const xpToAdd = interaction.options.getInteger('xp');
    
    // Vérification si le joueur existe dans la base de données
    const query = `SELECT * FROM joueurs WHERE username = '${joueur.username}'`;
    connection.query(query, async (err, rows) => {
      if (err) throw err;

      if (rows.length > 0) {
        const currentXP = rows[0].xp;
        const newXP = currentXP + xpToAdd;
        
        // Vérification si le joueur monte de niveau
        if (newXP >= 200) {
          const newLevel = rows[0].level + 1;
          const updateQuery = `UPDATE joueurs SET level = ${newLevel}, xp = 0 WHERE username = '${joueur.username}'`;
          connection.query(updateQuery, err => {
            if (err) throw err;
            interaction.reply(`Félicitations ${joueur.username}! Vous êtes maintenant niveau ${newLevel}!`);
          });
        } else {
          const updateQuery = `UPDATE joueurs SET xp = ${newXP} WHERE username = '${joueur.username}'`;
          connection.query(updateQuery, err => {
            if (err) throw err;
            interaction.reply(`${xpToAdd} XP ajoutés à ${joueur.username}. XP total : ${newXP}`);
          });
        }
      } else {
        interaction.reply(`Le joueur ${joueur.username} n'existe pas dans la base de données.`);
      }
    });
  },
};
