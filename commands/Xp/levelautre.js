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
    .setName('adminlevel')
    .setDescription('Voir le niveau, l\'XP et l\'XP restant pour le prochain niveau')
    .addUserOption(option => option.setName('joueur').setDescription('Le joueur dont vous souhaitez voir l\'XP')),
  async execute(interaction) {
    // Vérification si l'utilisateur est administrateur
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande.');
    }

    const joueur = interaction.options.getUser('joueur');

    // Vérifier si l'interaction a spécifié un joueur
    if (joueur) {
      const joueurID = joueur.id; // Obtenir l'ID Discord du joueur

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
            title: `Niveau et XP de ${joueur.username}`,
            description: `**Niveau : ${level}**\nXP : ${xp}\n*XP restant pour le prochain niveau : ${xpRemainingForNextLevel}*`,
            color: 0x00ff00 // Couleur de l'embed (vert dans cet exemple)
          };

          interaction.reply({ embeds: [embed] });
        } else {
          interaction.reply('Ce joueur n\'est pas enregistré dans la base de données.');
        }
      });
    } else {
      interaction.reply('Vous devez spécifier un joueur en utilisant la commande `/level @joueur`.');
    }
  },
};
