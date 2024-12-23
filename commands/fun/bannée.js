const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('important')
    .setDescription('Bientôt disponible'),
  async execute(interaction) {
    // Remplacez 'YOUR_GUILD_ID' par l'ID de votre serveur
    const guildId = '1075810201850105898';
    // Remplacez 'YOUR_CHANNEL_ID' par l'ID de votre salon
    const channelId = '1075810201850105898';

    try {
      const guild = await interaction.client.guilds.fetch(guildId);
      const channel = guild.channels.cache.get(channelId);

      if (channel?.isText()) {
        // Ajoutez ici le code pour envoyer le message dans un embed avec une photo
        const embed = {
          color: 0x0099ff,
          title: 'Bientôt disponible',
          description: 'Petit coquin 😏 tu as voulu savoir les nouveautés en avance🫠',
          image: {
            url: 'https://www.saintcyr78.fr/wp-content/uploads/2021/03/156058365_5408946662479457_4659439933302099438_n.jpg',
          },
        };

        const sentMessage = await channel.send({ embeds: [embed] });

        // Réponse à la commande initiale
        await interaction.reply('Message envoyé immédiatement.');
      } else {
        await interaction.reply('Erreur: Salon non trouvé.');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('Erreur lors de l\'exécution de la commande.');
    }
  },
};
