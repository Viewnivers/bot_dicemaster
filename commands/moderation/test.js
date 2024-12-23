const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const file = new AttachmentBuilder('../assets/discordjs.png');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
	async execute(interaction) {
		const exampleEmbed = {
			title: 'test',
			description: ('test')
            .setImage('attachment://Erlend.jpg')
		};

		await interaction.reply({ embeds: [exampleEmbed] });
	},
};
