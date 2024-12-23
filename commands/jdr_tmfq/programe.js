const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('programationtmfq')
    .setDescription('Admin: Information sur la programmation des séances (JDR_TMFQ)')
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
      description: '**The Medicine For Quest :**\n\n> On programme une séance pour le Jeux De Rôle nommé | The Medicine For Quest\n\n**Merci de cliqué sur intéressé si vous êtes dispo**\n*voir la date en cliquant sur le bouton*',
      image: {
        url: 'https://pbs.twimg.com/media/F5GvzbAXwAAEZqR?format=jpg&name=medium'
      }
    };

    const replyOptions = {
      embeds: [exampleEmbed],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 5,
          label: "Lien de l'événement",
          url: link, // Utiliser le lien extrait ici
          emoji: {
            name: '🔗'
          }
        }]
      }]
    };

    await interaction.reply(replyOptions);
  },
};
