const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annulation')
    .setDescription('Admin: Annulation de la programmation de la séances (JDR)')
    .addStringOption(option =>
      option.setName('lien')
        .setDescription('Le lien à donner')
        .setRequired(true)),
  async execute(interaction) {
    // Récupérer le message du salon Discord
    const messages = await interaction.channel.messages.fetch({ limit: 1 });
    // Vérifier si l'utilisateur a le rôle "admin"
    const isAdmin = interaction.member.roles.cache.some(role => role.name === 'admin');

    if (!isAdmin) {
        return interaction.reply({
            content: "Vous devez être administrateur pour utiliser cette commande.",
            ephemeral: true // Le message sera visible uniquement pour l'utilisateur qui a envoyé la commande
        });
    }
    
    // Vérifier si un message a été trouvé
    if (messages.size !== 1) {
      await interaction.reply('Aucun message trouvé dans ce salon.');
      return;
    }
    
    // Extraire le lien du message
    const link = interaction.options.getString('lien');

    const exampleEmbed = {
      title: '',
      description: '**ANNULATION JEUX DE RÔLE :**\n\n> En raison d\'une indisponibilité d\'un de nos joueure, nous annulons la séance prévus initialement pour la suite du Jeux De Rôle nommé | La Résilience\n\n*voir la date en cliquant sur le bouton*',
      image: {
        url: 'https://www.saintcyr78.fr/wp-content/uploads/2021/03/156058365_5408946662479457_4659439933302099438_n.jpg'
      }
    };

    const replyOptions = {
      embeds: [exampleEmbed],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 5, // Rouge
          label: "Lien de l'annulation",
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
