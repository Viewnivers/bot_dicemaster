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

// Liste des joueurs à afficher
const joueursAAfficher = [
  'Orion',
  //'Lord Nick',
  'Patrick Ecrous'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('present')
    .setDescription('Affiche les Joueurs qui doit etre présent'),

  async execute(interaction) {
    // Création de la requête SQL pour récupérer les joueurs et leur nombre de morts à partir de la table deaths
    const selectQuery = `SELECT username, deathCount FROM deaths WHERE username IN (${joueursAAfficher.map(() => '?').join(',')})`;
    const queryParams = joueursAAfficher;

    // Exécution de la requête SQL avec les paramètres
    connection.query(selectQuery, queryParams, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la récupération des disponibilités.');
      }

      // Création de l'embed pour afficher les disponibilités
      const exampleEmbed = {
        color: 0x9e0808,
        title: 'Liste des joueurs :',
        description: 'Voici les joueurs qui devront participer à cette session :',
        fields: []
      };

      results.forEach((user) => {
        exampleEmbed.fields.push({ name: user.username, value: `Nombre de morts : ${user.deathCount.toString()}`, inline: true });

      });

      // Envoie de l'embed à l'utilisateur
      interaction.reply({ 
        embeds: [exampleEmbed],
        ephemeral: false // Réponse éphémère visible uniquement par l'utilisateur
      });
    });
  },
};
