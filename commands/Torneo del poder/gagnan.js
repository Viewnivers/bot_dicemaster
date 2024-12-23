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
    .setName('declare_winner')
    .setDescription('Déclare le gagnant d\'un pari')
    .addIntegerOption(option =>
      option.setName('pari_id')
        .setDescription('ID du pari')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('winner')
        .setDescription('Le choix gagnant')
        .setRequired(true)),

  async execute(interaction) {
    const pariId = interaction.options.getInteger('pari_id');
    const winner = interaction.options.getString('winner');

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
      if (winner !== pari.choix1 && winner !== pari.choix2) {
        return interaction.reply('Le choix gagnant spécifié n\'est pas valide.');
      }

      // Calculer les cotes
      const calcOddsQuery = `SELECT 
                               SUM(CASE WHEN choix = '${pari.choix1}' THEN mise ELSE 0 END) AS somme_choix1, 
                               SUM(CASE WHEN choix = '${pari.choix2}' THEN mise ELSE 0 END) AS somme_choix2 
                             FROM bank_paris 
                             WHERE pari_id = ${pariId}`;

      connection.query(calcOddsQuery, (error, oddsResults) => {
        if (error) {
          console.error('Erreur lors du calcul des cotes :', error);
          return interaction.reply('Une erreur est survenue lors du calcul des cotes.');
        }

        const sommeChoix1 = oddsResults[0].somme_choix1 || 0;
        const sommeChoix2 = oddsResults[0].somme_choix2 || 0;

        let coteChoix1 = sommeChoix2 > 0 ? (sommeChoix2 / sommeChoix1).toFixed(2) : 1.00;
        let coteChoix2 = sommeChoix1 > 0 ? (sommeChoix1 / sommeChoix2).toFixed(2) : 1.00;

        // S'assurer que les cotes ne sont pas en dessous de 1.10
        coteChoix1 = Math.max(coteChoix1, 1.10).toFixed(2);
        coteChoix2 = Math.max(coteChoix2, 1.10).toFixed(2);

        const winnerCote = (winner === pari.choix1) ? coteChoix1 : coteChoix2;

        // Récupérer les votes pour ce pari
        const getVotesQuery = `SELECT * FROM bank_paris WHERE pari_id = ${pariId}`;

        connection.query(getVotesQuery, (error, votes) => {
          if (error) {
            console.error('Erreur lors de l\'exécution de la requête SQL :', error);
            return interaction.reply('Une erreur est survenue lors de la récupération des votes.');
          }

          votes.forEach(vote => {
            const user = interaction.client.users.cache.get(vote.user_id);
            if (user) {
              const gain = vote.mise * winnerCote; // Le gain est la mise multipliée par la cote
              const resultMessage = vote.choix === winner 
                ? `Félicitations ! Vous avez gagné le pari #${pariId} en choisissant **${winner}**. Vous gagnez ${gain} $.`
                : `Désolé, vous avez perdu le pari #${pariId}. Le choix gagnant était **${winner}**.`;

              if (vote.choix === winner) {
                // Créditez l'utilisateur gagnant
                const updateBalanceQuery = `UPDATE banks SET balance = balance + ${gain} WHERE user_id = '${vote.user_id}'`;
                connection.query(updateBalanceQuery, error => {
                  if (error) {
                    console.error(`Erreur lors de la mise à jour du solde pour ${vote.user_id}:`, error);
                  }
                });
              }

              user.send(resultMessage).catch(error => {
                console.error(`Impossible d'envoyer un message à ${vote.user_id}:`, error);
              });
            }
          });

          interaction.reply(`Le choix gagnant pour le pari #${pariId} a été déclaré: **${winner}**.`);
        });
      });
    });
  },
};
