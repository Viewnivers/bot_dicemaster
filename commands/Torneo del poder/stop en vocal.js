const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('stop_vocal_odds_display')
      .setDescription('Arrête l\'affichage des cotes dynamiques dans les salons vocaux'),
  
    async execute(interaction) {
      clearInterval(oddsUpdateInterval);
      interaction.reply('Affichage des cotes dans les salons vocaux arrêté.');
    },
  };
  