const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { resolve } = require('path');
const { createReadStream } = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue une musique spécifique dans un salon vocal'),

  async execute(interaction) {
    const voiceChannel = interaction.member?.voice.channel;

    console.log("Voice Channel:", voiceChannel); // Vérification de la récupération du salon vocal

    if (!voiceChannel) {
      console.log("No voice channel found");
      await interaction.reply('Vous devez être dans un salon vocal pour utiliser cette commande.');
      return;
    }

    const audioPath = resolve(__dirname, 'aqua.opus');
    console.log("Audio Path:", audioPath); // Vérification du chemin du fichier audio

    try {
      const resource = createAudioResource(createReadStream(audioPath));
      console.log("Audio Resource created");

      const player = createAudioPlayer();
      console.log("Audio Player created");

      player.on('debug', (message) => {
        console.log(`Debug: ${message}`);
      });

      player.on('error', (error) => {
        console.error(`Error: ${error.message}`);
      });

      player.on('end', () => {
        console.log('Music playback ended');
        const connection = getVoiceConnection(interaction.guildId);
        connection.destroy();
      });

      player.play(resource);
      console.log("Music started playing");

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      connection.subscribe(player);

      await interaction.reply('La musique est en train de jouer.');
    } catch (error) {
      console.error(error);
      await interaction.reply('Une erreur s\'est produite lors de la lecture de la musique.');
    }
  },
};
