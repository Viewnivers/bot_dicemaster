const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fin')
    .setDescription('Admin: Information sur la programmation des séances (JDR_Rés)')
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
      description: '**La Resilience :**\n\n> Salut à vous cher joueur, c\'est donc en ce jour que ce finalise cette campagne de jeux de rôle. Sa faisait maintenant 1 an que à casiment chaque dimanche on ce retrouvaient pour faire nos session. On en a eu des joueur qui son passer entre un médecin un peux bizzard au début, un piaf et une grand ligné de perso (Aodh, Arfon et Erlend.). Je pensse qu\'une team vas retire notre atenttion elle se compose de Lord Nick, Patrick Ecrous et Orion Claw. Entre t\'Lord nick nous a quitté pour laisser place à Rasheed.  \n\nNotre but principale étais de rejoindre la République de Kitia mais cette objectif à été dévier pour sauvé Clément le jeune enfant recruterpar Lord Nick.\nObjectif réussi aujourd\'hui ( Dimanche 12 Novembre 20233 ) ou Rasheed et Orion on enfin retrouver l\'enfant. Ils ont maintenant partis vivre dans l\'ancien ferme qui apartenait à la mere d\'Orion.\n\n Une pensser à Patrick qui étais le perso qui étais celui qui a survécue le plus longtemps et aussi à Lord Nick qui est surement le joueur du Jeux de Rôle.\n\n Bravo a N_ qui est le joueur qui est mort le moin de fois\n\n **Merci à Arbrofone pour nous avoir pondue ce jdr de caliter et bravo a vous tous**',
      image: {
        url: 'https://pbs.twimg.com/media/F-v4ITIWMAARKvn?format=jpg&name=small'
      }
    };

    const replyOptions = {
      embeds: [exampleEmbed],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 5,
          label: "A bientôt",
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
