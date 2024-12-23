const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Fait rejoindre le bot dans un salon vocal'),

    async execute(interaction) {
        // Vérifier si l'utilisateur est dans un salon vocal
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply('Vous devez être dans un salon vocal pour utiliser cette commande.');
            return;
        }

        // Vérifier si le bot a les autorisations nécessaires pour rejoindre le salon vocal
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            await interaction.reply('Je n\'ai pas les autorisations nécessaires pour rejoindre ou parler dans votre salon vocal.');
            return;
        }

        // Rejoindre le salon vocal de l'utilisateur
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        await interaction.reply('Le bot a rejoint le salon vocal.');
    },
};
