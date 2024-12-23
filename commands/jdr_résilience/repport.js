const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Admin: info de la programmation de la séances (JDR)')
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
      description: '** SESSION DEPLACER :**\n\n> Notre session de jdr est déplacer à une date ultérieure voir en cliquant sur le bouton si dessous*',
      image: {
        url: 'https://pbs.twimg.com/media/F14l2a7WYAAY1SS?format=png&name=small'
      }
    };

    const replyOptions = {
      embeds: [exampleEmbed],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 5, // Rouge
          label: "Nouvelle date ici",
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
