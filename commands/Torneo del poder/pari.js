const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
    .setName('create_paris')
    .setDescription('Créer un pari avec deux choix')
    .addStringOption(option => 
      option.setName('choix1')
        .setDescription('Le premier choix')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('choix2')
        .setDescription('Le deuxième choix')
        .setRequired(true)),

  async execute(interaction) {
    const choix1 = interaction.options.getString('choix1');
    const choix2 = interaction.options.getString('choix2');

    // Insertion du pari dans la base de données
    const insertQuery = `INSERT INTO paris (choix1, choix2) VALUES ('${choix1}', '${choix2}')`;

    connection.query(insertQuery, (error, results) => {
      if (error) {
        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
        return interaction.reply('Une erreur est survenue lors de la création du pari.');
      }

      const pariId = results.insertId;

      const embed = {
        title: 'Nouveau Pari!',
        description: `Pari #${pariId}: Choisissez entre **${choix1}** et **${choix2}**`,
        color: 0x00AAFF,
      };

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`bet_${pariId}_${choix1}`)
            .setLabel(choix1)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`bet_${pariId}_${choix2}`)
            .setLabel(choix2)
            .setStyle(ButtonStyle.Secondary)
        );

      interaction.reply({ embeds: [embed], components: [row] });
    });
  },
};
