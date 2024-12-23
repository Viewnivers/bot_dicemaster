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
    .setName('buy')
    .setDescription('Achetez un article du shop')
    .addStringOption(option => option.setName('article').setDescription('Nom de l\'article à acheter').setRequired(true)),

  async execute(interaction) {
    // Récupération de l'identifiant de l'utilisateur
    const userId = interaction.user.id;

    // Récupération du nom de l'article à acheter depuis l'option de la commande
    const articleName = interaction.options.getString('article');

    try {
      // Création de la requête SQL pour récupérer l'article du shop
      const selectArticleQuery = `SELECT * FROM shop_items WHERE name = '${articleName}'`;

      // Exécution de la requête SQL pour récupérer l'article du shop
      connection.query(selectArticleQuery, async (error, results) => {
        if (error) {
          console.error('Erreur lors de l\'exécution de la requête SQL pour récupérer l\'article du shop :', error);
          return interaction.reply('Une erreur s\'est produite lors de l\'achat. Veuillez réessayer ultérieurement.');
        }

        if (results.length === 0) {
          // L'article n'a pas été trouvé dans le shop
          return interaction.reply(`L'article "${articleName}" n'existe pas dans le shop.`);
        }

        // Récupérer le prix de l'article et l'ID du rôle associé
        const articlePrice = results[0].price;
        const roleId = results[0].role_id;

        // Création de la requête SQL pour récupérer le solde de la banque de l'utilisateur
        const selectBalanceQuery = `SELECT balance FROM banks WHERE user_id = '${userId}'`;

        // Exécution de la requête SQL pour récupérer le solde de la banque de l'utilisateur
        connection.query(selectBalanceQuery, async (balanceError, balanceResults) => {
          if (balanceError) {
            console.error('Erreur lors de l\'exécution de la requête SQL pour récupérer le solde de la banque :', balanceError);
            return interaction.reply('Une erreur s\'est produite lors de l\'achat. Veuillez réessayer ultérieurement.');
          }

          if (balanceResults.length === 0) {
            // L'utilisateur n'a pas de compte bancaire
            return interaction.reply('Vous n\'avez pas de compte bancaire. Veuillez utiliser la commande `/bank` pour en créer un.');
          }

          // Récupérer le solde de la banque de l'utilisateur
          const userBalance = balanceResults[0].balance;

          // Vérifier si l'utilisateur a suffisamment d'argent pour acheter l'article
          if (userBalance < articlePrice) {
            return interaction.reply('Vous n\'avez pas assez d\'argent pour acheter cet article.');
          }

          // Créer une transaction pour acheter l'article
          connection.beginTransaction(async (transactionError) => {
            if (transactionError) {
              console.error('Erreur lors de la création de la transaction pour l\'achat :', transactionError);
              return interaction.reply('Une erreur s\'est produite lors de l\'achat. Veuillez réessayer ultérieurement.');
            }

            try {
              // Déduire le prix de l'article du solde de la banque de l'utilisateur
              const updatedBalance = userBalance - articlePrice;
              const updateBalanceQuery = `UPDATE banks SET balance = ${updatedBalance} WHERE user_id = '${userId}'`;
              await connection.query(updateBalanceQuery);

              // Accorder le rôle à l'utilisateur
              if (roleId) {
                const member = interaction.guild.members.cache.get(userId);
                if (member) {
                  const role = interaction.guild.roles.cache.get(roleId);
                  if (role) {
                    member.roles.add(role).catch(console.error);
                  }
                }
              }

              // Enregistrer l'achat de l'article dans la table user_items
              const insertItemQuery = `INSERT INTO user_items (user_id, item_id) VALUES ('${userId}', ${results[0].id})`;
              await connection.query(insertItemQuery);

              // Valider la transaction
              connection.commit(async (commitError) => {
                if (commitError) {
                  console.error('Erreur lors de la validation de la transaction pour l\'achat :', commitError);
                  await connection.rollback(); // Annuler la transaction en cas d'erreur
                  return interaction.reply('Une erreur s\'est produite lors de l\'achat. Veuillez réessayer ultérieurement.');
                }

                // L'achat a été effectué avec succès
                await interaction.reply(`Félicitations, vous avez acheté l'article "${results[0].name}" pour ${articlePrice} pièces. Il a été ajouté à votre collection.`);
              });
            } catch (buyError) {
              // En cas d'erreur lors de l'achat, annuler la transaction
              await connection.rollback();
              console.error('Erreur lors de l\'achat. La transaction a été annulée :', buyError);
              await interaction.reply('Une erreur s\'est produite lors de l\'achat. Veuillez réessayer ultérieurement.');
            }
          });
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête SQL pour récupérer l\'article du shop :', error);
      interaction.reply('Une erreur s\'est produite lors de l\'achat. Veuillez réessayer ultérieurement.');
    }
  },
};
