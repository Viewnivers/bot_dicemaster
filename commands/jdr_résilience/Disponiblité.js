const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');

// Créer une connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "DiceMaster"
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dispo')
    .setDescription('Validation des disponibilités des joueurs (JDR)'),
  async execute(interaction) {
    const exampleEmbed = {
      title: 'DISPONIBILITÉ POUR LE JEU DE RÔLE :',
      description: 'Réponse avant vendredi (inclus)\n',
    };

    // Créer le message contenant les informations de disponibilité
    const message = await interaction.reply({ embeds: [exampleEmbed] });

    // Ajouter les réactions au message renvoyé
    await message.react('✅'); // Première réaction
    await message.react('❌'); // Deuxième réaction

    // Filtrer les réactions pour n'accepter que celles provenant d'utilisateurs
    const filter = (reaction, user) => {
      return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot;
    };

    // Collecter les réactions pendant un certain délai (en millisecondes)
    const collector = message.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', async (reaction, user) => {
      const chosenRole = reaction.emoji.name === '✅' ? 'DISPONIBLE' : 'INDISPONIBLE'; // Remplacez 'Role1' et 'Role2' par les noms de rôles souhaités

      // Récupérer le membre depuis l'interaction
      const member = interaction.guild.members.cache.get(user.id);

      // Vérifier si le membre possède déjà le rôle choisi
      if (!member.roles.cache.some(role => role.name === chosenRole)) {
        try {
          // Ajouter le rôle au membre
          await member.roles.add(chosenRole);
          // Insérer le rôle dans la base de données
          const insertQuery = `INSERT INTO roles (member_id, role_name) VALUES ('${user.id}', '${chosenRole}')`;
          connection.query(insertQuery, (err, result) => {
            if (err) throw err;
            console.log('Rôle ajouté dans la base de données');
          });
        } catch (error) {
          console.error('Erreur lors de l\'ajout du rôle :', error);
        }
      }
    });

    collector.on('end', collected => {
      console.log(`Collecte des réactions terminée. ${collected.size} réactions collectées.`);
    });
  },
};
