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
    .setName('rank-level')
    .setDescription('Affiche le classement des utilisateurs en fonction de leur niveau et de leur XP'),

  async execute(interaction) {
    // Création de la requête SQL pour récupérer les utilisateurs triés par niveau décroissant, puis par XP décroissante
    const selectQuery = 'SELECT username, level, xp FROM joueurs ORDER BY level DESC, xp DESC';

    // Exécution de la requête SQL
    connection.query(selectQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la récupération du classement.');
      }

      // Création de l'embed pour afficher le classement
      const embed = {
        title: 'Classement des utilisateurs :',
        description: '',
        color: 0x00ff00, // Couleur de l'embed (vert dans cet exemple)
        fields: [] // Tableau de champs pour les entrées du classement
      };

      results.forEach((user, index) => {
        let place;
        if (index === 0) {
          place = ':first_place:';
        } else if (index === 1) {
          place = ':second_place:';
        } else if (index === 2) {
          place = ':third_place:';
        } else {
          const emojis = [':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];
          place = emojis[index - 3];
        }

        // Ajout de l'entrée du classement au champ
        embed.fields.push({
          name: `${place} ${user.username}`,
          value: `Niveau : ${user.level}, XP : ${user.xp}`,
          inline: false // Mettez-le à true si vous souhaitez afficher les entrées en ligne
        });
      });

      // Envoie de l'embed à l'utilisateur
      interaction.reply({ embeds: [embed] });
    });
  },
};
