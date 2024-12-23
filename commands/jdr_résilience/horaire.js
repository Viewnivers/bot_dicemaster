const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('horaire')
    .setDescription('Admin: Information sur l\'horaire des séances (JDR)')
    .addStringOption(option =>
      option.setName('lien')
        .setDescription('Le lien à donner')
        .setRequired(true)),
  async execute(interaction) {
    // Récupérer le message du salon Discord
   
    // Vérifier si l'utilisateur a le rôle "admin"
    const isAdmin = interaction.member.roles.cache.some(role => role.name === 'admin');

    if (!isAdmin) {
        return interaction.reply({
            content: "Vous devez être administrateur pour utiliser cette commande.",
            ephemeral: true // Le message sera visible uniquement pour l'utilisateur qui a envoyé la commande
        });
    }
    
 
    // Extraire le lien du message
    const link = interaction.options.getString('lien');

    const exampleEmbed = {
      color: 0x9e0808,
      title: '',
      description: '**MODIFICATION DE L\'HORAIRE  :**\n\n> Voici les horaires : \n14H30 - 18H\nJeux De Rôle | La Résilience',
      image: {
        url: ''
      }
    };

    const replyOptions = {
      embeds: [exampleEmbed],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 5,
          label: "Modification de l'horaire",
          url: link, // Utiliser le lien extrait ici
          emoji: {
            name: '🕰️'
          }
        }]
      }]
    };

    await interaction.reply(replyOptions);
  },
};
