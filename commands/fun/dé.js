const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dé')
        .setDescription('Lance un dé')
        .addIntegerOption(option =>
            option.setName('nombre_de_faces')
                .setDescription('Le nombre de faces du dé')
                .setRequired(true)),
    execute(interaction) {
        const nombreDeFaces = interaction.options.getInteger('nombre_de_faces');
        
        if (nombreDeFaces <= 1) {
            return interaction.reply({
                content: 'Le nombre de faces du dé doit être supérieur à 1.',
                ephemeral: true
            });
        }
        
        const resultat = Math.floor(Math.random() * nombreDeFaces) + 1;

        const embed = {
            color: 0x0099ff,
            title: `Dé de ${nombreDeFaces} `,
            description:( ' \n '+   
            `${resultat}  `)  ,
        };

        interaction.reply({ embeds: [embed] });
    },
};
