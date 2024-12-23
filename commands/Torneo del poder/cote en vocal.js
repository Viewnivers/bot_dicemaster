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
let lastPariId = null;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start_vocal_odds_display')
    .setDescription('Démarre l\'affichage des côtes dynamiques dans deux salons vocaux'),

  async execute(interaction) {
    // Vérification du dernier pari créé
    const checkLastPariQuery = `SELECT * FROM paris ORDER BY id DESC LIMIT 1`;
    connection.query(checkLastPariQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la vérification du dernier pari.');
      }

      if (results.length === 0) {
        return interaction.reply('Aucun pari trouvé.');
      }

      const pari = results[0];
      lastPariId = pari.id;

      // Création des salons vocaux
      Promise.all([
        interaction.guild.channels.create({
          name: `Côtes ${pari.choix1}`,
          type: 2,  // Type 2 correspond aux salons vocaux
        }),
        interaction.guild.channels.create({
          name: `Côtes ${pari.choix2}`,
          type: 2,  // Type 2 correspond aux salons vocaux
        })
      ]).then(([channel1, channel2]) => {
        interaction.reply(`Salons vocaux créés : ${channel1.name} et ${channel2.name}`);

        // Mettre à jour les côtes toutes les 10 secondes
        oddsUpdateInterval = setInterval(() => {
          updateVocalOdds(pari.id, pari, channel1, channel2);
        }, 1000);
      }).catch(error => {
        console.error('Erreur lors de la création des salons vocaux :', error);
        interaction.reply('Une erreur est survenue lors de la création des salons vocaux.');
      });
    });
  },
};

// Fonction pour mettre à jour les côtes dans les salons vocaux
function updateVocalOdds(pariId, pari, channel1, channel2) {
  const calcOddsQuery = `SELECT 
                           SUM(CASE WHEN choix = '${pari.choix1}' THEN mise ELSE 0 END) AS somme_choix1, 
                           SUM(CASE WHEN choix = '${pari.choix2}' THEN mise ELSE 0 END) AS somme_choix2 
                         FROM bank_paris 
                         WHERE pari_id = ${pariId}`;

  connection.query(calcOddsQuery, (error, oddsResults) => {
    if (error) {
      console.error('Erreur lors du calcul des côtes :', error);
      channel1.setName('Erreur lors du calcul des côtes.');
      channel2.setName('Erreur lors du calcul des côtes.');
      return;
    }

    const sommeChoix1 = oddsResults[0].somme_choix1 || 0;
    const sommeChoix2 = oddsResults[0].somme_choix2 || 0;

    let coteChoix1 = sommeChoix2 > 0 ? (sommeChoix2 / sommeChoix1).toFixed(2) : 1.00;
    let coteChoix2 = sommeChoix1 > 0 ? (sommeChoix1 / sommeChoix2).toFixed(2) : 1.00;

    // S'assurer que les côtes ne sont pas en dessous de 1.10
    coteChoix1 = Math.max(coteChoix1, 1.10).toFixed(2);
    coteChoix2 = Math.max(coteChoix2, 1.10).toFixed(2);

    channel1.setName(`Côte ${pari.choix1}: ${coteChoix1}`);
    channel2.setName(`Côte ${pari.choix2}: ${coteChoix2}`);
  });
}
