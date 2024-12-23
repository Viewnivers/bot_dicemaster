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
    .setName('place_bet')
    .setDescription('Place un pari sur un choix')
    .addIntegerOption(option =>
      option.setName('pari_id')
        .setDescription('ID du pari')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('choix')
        .setDescription('Le choix sur lequel parier')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('mise')
        .setDescription('Montant de la mise')
        .setRequired(true)),

  async execute(interaction) {
    const pariId = interaction.options.getInteger('pari_id');
    const choix = interaction.options.getString('choix');
    const mise = interaction.options.getNumber('mise');
    const userId = interaction.user.id;

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
      if (choix !== pari.choix1 && choix !== pari.choix2) {
        return interaction.reply('Le choix spécifié n\'est pas valide.');
      }

      // Vérification du solde de l'utilisateur
      const checkBalanceQuery = `SELECT balance FROM banks WHERE user_id = '${userId}'`;
      connection.query(checkBalanceQuery, (error, results) => {
        if (error) {
          console.error('Erreur lors de l\'exécution de la requête SQL :', error);
          return interaction.reply('Une erreur est survenue lors de la vérification de votre solde.');
        }

        if (results.length === 0) {
          return interaction.reply('Vous n\'avez pas de compte bancaire. Utilisez la commande appropriée pour créer un compte.');
        }

        const balance = results[0].balance;
        if (balance < mise) {
          return interaction.reply('Votre solde est insuffisant pour placer ce pari.');
        }

        // Mise à jour du solde de l'utilisateur
        const updateBalanceQuery = `UPDATE banks SET balance = balance - ${mise} WHERE user_id = '${userId}'`;
        connection.query(updateBalanceQuery, error => {
          if (error) {
            console.error('Erreur lors de la mise à jour du solde :', error);
            return interaction.reply('Une erreur est survenue lors de la mise à jour de votre solde.');
          }

          // Insertion du pari
          const insertBetQuery = `INSERT INTO bank_paris (pari_id, user_id, choix, mise) VALUES (${pariId}, '${userId}', '${choix}', ${mise})`;
          connection.query(insertBetQuery, error => {
            if (error) {
              console.error('Erreur lors de l\'insertion du pari :', error);
              return interaction.reply('Une erreur est survenue lors de l\'enregistrement de votre pari.');
            }

            // Calcul des côtes dynamiques
            const calcOddsQuery = `SELECT 
                                     SUM(CASE WHEN choix = '${pari.choix1}' THEN mise ELSE 0 END) AS somme_choix1, 
                                     SUM(CASE WHEN choix = '${pari.choix2}' THEN mise ELSE 0 END) AS somme_choix2 
                                   FROM bank_paris 
                                   WHERE pari_id = ${pariId}`;

            connection.query(calcOddsQuery, (error, oddsResults) => {
              if (error) {
                console.error('Erreur lors du calcul des côtes :', error);
                return interaction.reply('Une erreur est survenue lors du calcul des côtes.');
              }

              const sommeChoix1 = oddsResults[0].somme_choix1 || 0;
              const sommeChoix2 = oddsResults[0].somme_choix2 || 0;

              let coteChoix1 = sommeChoix2 > 0 ? (sommeChoix2 / sommeChoix1).toFixed(2) : 1.00;
              let coteChoix2 = sommeChoix1 > 0 ? (sommeChoix1 / sommeChoix2).toFixed(2) : 1.00;

              // S'assurer que les côtes ne sont pas en dessous de 1.10
              coteChoix1 = Math.max(coteChoix1, 1.10).toFixed(2);
              coteChoix2 = Math.max(coteChoix2, 1.10).toFixed(2);

              interaction.reply(`Votre pari de ${mise} $ sur **${choix}** a été enregistré avec succès.\nCôtes actuelles:\n**${pari.choix1}**: ${coteChoix1}\n**${pari.choix2}**: ${coteChoix2}`);
            });
          });
        });
      });
    });
  },
};
