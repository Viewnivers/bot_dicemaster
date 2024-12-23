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
    .setName('xpmultiple')
    .setDescription('Ajoute de l\'XP à un ou plusieurs joueurs')
    .addStringOption(option => option.setName('joueurs').setDescription('Liste des joueurs séparés par des virgules').setRequired(true))
    .addIntegerOption(option => option.setName('xp').setDescription('Le montant d\'XP à ajouter').setRequired(true)),
  async execute(interaction) {
    const joueursMentions = interaction.options.getString('joueurs').split(',');
    const xpToAdd = interaction.options.getInteger('xp');

    // Boucle sur la liste des mentions d'utilisateurs pour extraire les IDs Discord
    const joueursIDs = joueursMentions.map(mention => {
      const userID = mention.match(/\d+/); // Extrayez l'ID Discord à partir de la mention
      return userID ? userID[0] : null;
    }).filter(Boolean);

    // Boucle sur la liste des IDs Discord pour ajouter l'XP
    joueursIDs.forEach(joueurID => {
      // Vérification si le joueur existe dans la table "joueurs" de la base de données
      const query = `SELECT * FROM joueurs WHERE id = '${joueurID}'`;
      connection.query(query, async (err, rows) => {
        if (err) throw err;

        if (rows.length > 0) {
          const currentXP = rows[0].xp;
          const newXP = currentXP + xpToAdd;
          console.log(`Ajout de ${xpToAdd} XP à ${joueurID}. XP actuelle : ${currentXP}, XP total après ajout : ${newXP}`);

          // Vérification si le joueur monte de niveau
          if (newXP >= 200) {
            const newLevel = rows[0].level + 1;
            console.log(`${joueurID} monte de niveau à ${newLevel}`);
            const updateQuery = `UPDATE joueurs SET level = ${newLevel}, xp = 0 WHERE id = '${joueurID}'`;
            connection.query(updateQuery, err => {
              if (err) throw err;
            });
          } else {
            const updateQuery = `UPDATE joueurs SET xp = ${newXP} WHERE id = '${joueurID}'`;
            connection.query(updateQuery, err => {
              if (err) throw err;
            });
          }
        } else {
          console.log(`Le joueur avec l'ID Discord ${joueurID} n'existe pas dans la table "joueurs" de la base de données.`);
        }
      });
    });

    interaction.reply(`XP ajoutée à ${joueursIDs.length} joueur(s).`);
  },
};
