const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('stop_odds_display')
      .setDescription('Arrête l\'affichage des côtes dynamiques'),
  
    async execute(interaction) {
      clearInterval(oddsUpdateInterval);
      interaction.reply('Affichage des côtes arrêté.');
    },
  };
  