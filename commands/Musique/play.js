const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const { createAudioResource, StreamType, createAudioPlayer, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yt')
        .setDescription('Joue de la musique')
        .addStringOption(option =>
            option.setName('musique')
                .setDescription('Lien YouTube de la musique')
                .setRequired(true)),

    async execute(interaction) {
        const song = interaction.options.getString('musique');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('Veuillez rejoindre un salon vocal avant de jouer de la musique.');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const stream = ytdl(song, { filter: 'audioonly' });
        const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });

        const player = createAudioPlayer();
        player.play(resource);

        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        interaction.reply('La musique est en train d\'être jouée.');
    },
};
