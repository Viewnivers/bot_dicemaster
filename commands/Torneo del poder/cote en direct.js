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

let oddsUpdateInterval;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start_odds_display')
    .setDescription('Démarre l\'affichage des côtes dynamiques pour un pari')
    .addIntegerOption(option =>
      option.setName('pari_id')
        .setDescription('ID du pari')
        .setRequired(true)),

  async execute(interaction) {
    const pariId = interaction.options.getInteger('pari_id');

    // Vérification si le pari existe
    const checkPariQuery = `SELECT * FROM paris WHERE id = ${pariId}`;
    connection.query(checkPariQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la vérification du pari.');
      }

      if (results.length === 0) {
        return interaction.reply('Le pari spécifié n\'existe pas.');
      }

      const pari = results[0];

      // Envoi du message initial
      interaction.reply('Affichage des côtes démarré. Les côtes seront mises à jour toutes les 10 secondes.')
        .then(() => {
          interaction.channel.send(`Côtes actuelles pour le pari **${pariId}**:\n**${pari.choix1}**: Calcul en cours...\n**${pari.choix2}**: Calcul en cours...`)
            .then(message => {
              // Mettre à jour les côtes toutes les 10 secondes
              oddsUpdateInterval = setInterval(() => {
                updateOdds(pariId, pari, message);
              }, 10000);
            });
        });
    });
  },
};

// Fonction pour mettre à jour les côtes
function updateOdds(pariId, pari, message) {
  const calcOddsQuery = `SELECT 
                           SUM(CASE WHEN choix = '${pari.choix1}' THEN mise ELSE 0 END) AS somme_choix1, 
                           SUM(CASE WHEN choix = '${pari.choix2}' THEN mise ELSE 0 END) AS somme_choix2 
                         FROM bank_paris 
                         WHERE pari_id = ${pariId}`;

  connection.query(calcOddsQuery, (error, oddsResults) => {
    if (error) {
      console.error('Erreur lors du calcul des côtes :', error);
      message.edit('Erreur lors du calcul des côtes.');
      return;
    }

    const sommeChoix1 = oddsResults[0].somme_choix1 || 0;
    const sommeChoix2 = oddsResults[0].somme_choix2 || 0;

    let coteChoix1 = sommeChoix2 > 0 ? (sommeChoix2 / sommeChoix1).toFixed(2) : 1.00;
    let coteChoix2 = sommeChoix1 > 0 ? (sommeChoix1 / sommeChoix2).toFixed(2) : 1.00;

    // S'assurer que les côtes ne sont pas en dessous de 1.10
    coteChoix1 = Math.max(coteChoix1, 1.10).toFixed(2);
    coteChoix2 = Math.max(coteChoix2, 1.10).toFixed(2);

    message.edit(`Côtes actuelles pour le pari **${pariId}**:\n**${pari.choix1}**: ${coteChoix1}\n**${pari.choix2}**: ${coteChoix2}`);
  });
}
