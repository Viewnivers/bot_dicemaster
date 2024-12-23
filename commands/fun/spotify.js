const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { resolve } = require('path');
const axios = require('axios'); // Module pour effectuer des requêtes HTTP

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deezer')
    .setDescription('Joue une musique spécifique dans un salon vocal depuis Deezer'),

  async execute(interaction) {
    const voiceChannel = interaction.member?.voice.channel;

    if (!voiceChannel) {
      await interaction.reply('Vous devez être dans un salon vocal pour utiliser cette commande.');
      return;
    }

    try {
      // Utilisation de l'API Deezer pour rechercher une piste musicale
      const searchResult = await axios.get(`https://api.deezer.com/search?q=nom_de_la_piste`);

      // Récupération du premier résultat de la recherche
      const track = searchResult.data.data[0]; // Adapter la logique pour récupérer la piste souhaitée

      // Récupération de l'URL du preview de la piste
      const audioURL = track.preview;

      const resource = createAudioResource(audioURL, {
        inputType: 'url',
      });

      const player = createAudioPlayer();

      player.on('error', (error) => {
        console.error(`Error: ${error.message}`);
      });

      player.on('end', () => {
        console.log('Music playback ended');
        const connection = getVoiceConnection(interaction.guildId);
        connection.destroy();
      });

      player.play(resource);

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      connection.subscribe(player);

      await interaction.reply('La musique de Deezer est en train de jouer.');
    } catch (error) {
      console.error(error);
      await interaction.reply('Une erreur s\'est produite lors de la lecture de la musique depuis Deezer.');
    }
  },
};
