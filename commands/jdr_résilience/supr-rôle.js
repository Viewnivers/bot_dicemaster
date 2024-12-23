const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supr-rôle')
        .setDescription('Admin: Supprimer les rôles (JDR)'),
    async execute(interaction) {
        // Vérifier si l'utilisateur a le rôle "admin"
        const isAdmin = interaction.member.roles.cache.some(role => role.name === 'admin');

        if (!isAdmin) {
            return interaction.reply({
                content: "Vous devez être administrateur pour utiliser cette commande.",
                ephemeral: true // Le message sera visible uniquement pour l'utilisateur qui a envoyé la commande
            });
        }

        const exampleEmbed = {
            title: 'Supprimer les rôles :',
            description: '\n',
        };

        await interaction.reply({
            embeds: [exampleEmbed],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 4, // Rouge
                        label: 'Retirer les rôles',
                        custom_id: 'remove_roles_button',
                        emoji: ''
                    },
                ]
            }]
        });

        // Gérer les interactions de boutons
        const filter = (i) => i.customId.startsWith('remove_roles_button');
        const collector = interaction.channel.createMessageComponentCollector({ filter });

        collector.on('collect', async (buttonInteraction) => {
            const guild = buttonInteraction.guild;

            // Récupérer les rôles 'DISPONIBLE' et 'INDISPONIBLE'
            const availableRoleId = '1111260441121931306';
            const unavailableRoleId = '1111260572655300649';
            const availableRole = guild.roles.cache.get(availableRoleId);
            const unavailableRole = guild.roles.cache.get(unavailableRoleId);

            if (availableRole && unavailableRole) {
                // Retirer les rôles de tous les membres
                guild.members.cache.forEach(async (member) => {
                    await member.roles.remove(availableRole);
                    await member.roles.remove(unavailableRole);
                });

                await buttonInteraction.reply('Les rôles ont été retirés de tous les membres.');
                
            } else {
                await buttonInteraction.reply('Les rôles associés aux boutons sont introuvables.');
                
            }
        });

        collector.on('end', () => {
            // Supprimer les boutons après la fin de la collecte
            interaction.editReply({ components: [] });
        });
    },
};
