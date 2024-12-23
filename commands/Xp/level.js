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
    .setName('niveau')
    .setDescription('Voir le niveau, l\'XP et l\'XP restant pour le prochain niveau'),
  async execute(interaction) {
    const joueurID = interaction.user.id; // Obtenir l'ID Discord du joueur

    // Requête pour récupérer les informations du joueur
    const query = `SELECT level, xp FROM joueurs WHERE id = '${joueurID}'`;
    connection.query(query, (err, rows) => {
      if (err) throw err;

      if (rows.length > 0) {
        const level = rows[0].level;
        const xp = rows[0].xp;
        const xpNeededForNextLevel = 200; // XP nécessaire pour passer au niveau suivant (vous pouvez ajuster cela)
        const xpRemainingForNextLevel = xpNeededForNextLevel - xp;

        // Création de l'embed
        const embed = {
          title: `Niveau et XP de ${interaction.user.username}`,
          description: `**Niveau : ${level}**\nXP : ${xp}\n*XP restant pour le prochain niveau : ${xpRemainingForNextLevel}*`,
          color: 0x00ff00 // Couleur de l'embed (vert dans cet exemple)
        };

        interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply('Vous n\'êtes pas encore enregistré dans la base de données.');
      }
    });
  },
};
