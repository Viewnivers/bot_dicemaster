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
        .setName('bank')
        .setDescription('Affiche le contenu de votre banque'),

    async execute(interaction) {
        // Récupération de l'identifiant de l'utilisateur
        const userId = interaction.user.id;

        // Création de la requête SQL pour récupérer le contenu de la banque de l'utilisateur
        const selectQuery = `SELECT * FROM banks WHERE user_id = '${userId}'`;

        // Déclaration de replyOptions à l'extérieur de la fonction de rappel
        let replyOptions;

        // Création d'une promesse pour exécuter la requête SQL
        const queryPromise = new Promise((resolve, reject) => {
            // Exécution de la requête SQL
            connection.query(selectQuery, (error, results) => {
                if (error) {
                    console.error('Erreur lors de l\'exécution de la requête SQL :', error);
                    reject(error);
                }

                // Si la requête s'est exécutée avec succès
                if (results.length === 0) {
                    replyOptions = 'Votre banque est vide.';
                } else {
                    const bankContent = results[0]; // On suppose qu'il n'y a qu'un seul enregistrement par utilisateur dans la table banks

                    // Extraire le lien du message
                    const link = interaction.options.getString('lien');

                    const exampleEmbed = {
                        color: 0x00ff00,
                        title: `Bank de ${interaction.user.username}`,
                        description: `${bankContent.balance} $ `,
                       
                    };

                    // Vérifier si link est défini et n'est pas vide
                    if (link) {
                        replyOptions = {
                            embeds: [exampleEmbed],
                            components: [{
                                type: 1,
                                components: [{
                                    type: 2,
                                    style: 5,
                                    label: "Lien de l'événement",
                                    url: link,
                                    emoji: {
                                        name: '🔗'
                                    }
                                }]
                            }]
                        };
                    } else {
                        replyOptions = {
                            embeds: [exampleEmbed]
                        };
                    }
                }

                resolve();
            });
        });

        // Attendre la résolution de la promesse
        await queryPromise;

        // Répondre à l'interaction
        await interaction.reply(replyOptions);
    },
};
