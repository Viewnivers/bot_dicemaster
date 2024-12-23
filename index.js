const { Client, Collection, GatewayIntentBits, Events, PermissionFlagsBits } = require('discord.js');
const mysql = require('mysql');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const loadDatabase = require("./events/loadDatabase");

require('./deploy-commands.js');
const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(__dirname, 'commands', folder, file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command ${file} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(__dirname, 'events', file));
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Base de données
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "DiceMaster"
};
const connection = mysql.createConnection(dbConfig);

let coteChannelA = null;
let coteChannelB = null;

client.once('ready', async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    // Vérifiez si les salons vocaux existent, sinon, créez-les
    coteChannelA = guild.channels.cache.find(channel => channel.name.startsWith('Cote A'));
    coteChannelB = guild.channels.cache.find(channel => channel.name.startsWith('Cote B'));

    if (!coteChannelA) {
        coteChannelA = await guild.channels.create({ name: 'Cote A', type: 2 });
    }
    if (!coteChannelB) {
        coteChannelB = await guild.channels.create({ name: 'Cote B', type: 2 });
    }

    await guild.commands.fetch();
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Stocker les informations de pari temporairement
const betSessions = new Map();

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        const [action, pariId, choix] = interaction.customId.split('_');

        if (action === 'bet') {
            const guild = interaction.guild;
            const user = interaction.user;

            // Crée un salon privé pour l'utilisateur et le bot
            const channel = await guild.channels.create({
                name: `pari-${user.username}`,
                type: 0, // 0 corresponds to GUILD_TEXT
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    },
                ],
            });

            betSessions.set(user.id, { pariId, choix, channel });

            await interaction.reply({ content: `Un salon privé a été créé pour vous permettre de parier.`, ephemeral: true });

            await channel.send(`Vous avez choisi **${choix}**. Veuillez saisir le montant que vous souhaitez parier.`);
        }
    }
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    const betSession = betSessions.get(message.author.id);
    if (betSession && message.channel.id === betSession.channel.id) {
        const amount = message.content.trim();
        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return message.channel.send('Veuillez entrer un montant valide.');
        }

        const { pariId, choix } = betSession;
        const userId = message.author.id;

        // Vérifier le solde de l'utilisateur
        const checkBalanceQuery = `SELECT balance FROM banks WHERE user_id = '${userId}'`;

        connection.query(checkBalanceQuery, (error, results) => {
            if (error) {
                console.error('Erreur lors de la vérification du solde :', error);
                return message.channel.send('Une erreur est survenue lors de la vérification de votre solde.');
            }

            const balance = results[0]?.balance || 0;
            if (balance < parsedAmount) {
                return message.channel.send('Vous n\'avez pas assez de solde pour effectuer ce pari.');
            }

            // Déduire le montant parié du solde de l'utilisateur
            const updateBalanceQuery = `UPDATE banks SET balance = balance - ${parsedAmount} WHERE user_id = '${userId}'`;

            connection.query(updateBalanceQuery, (error) => {
                if (error) {
                    console.error('Erreur lors de la mise à jour du solde :', error);
                    return message.channel.send('Une erreur est survenue lors de la mise à jour de votre solde.');
                }

                // Insertion du pari dans la base de données
                const insertBetQuery = `INSERT INTO bank_paris (user_id, pari_id, choix, mise) VALUES ('${userId}', ${pariId}, '${choix}', ${parsedAmount})`;

                connection.query(insertBetQuery, (error) => {
                    if (error) {
                        console.error('Erreur lors de l\'exécution de la requête SQL :', error);
                        return message.channel.send('Une erreur est survenue lors de la saisie de votre pari.');
                    }

                    message.channel.send(`Votre pari de ${parsedAmount}$ sur **${choix}** a été enregistré!`).then(msg => {
                        setTimeout(() => {
                            msg.channel.delete().catch(console.error);
                        }, 30000); // Supprime le salon après 30 secondes
                    }).catch(console.error);

                    betSessions.delete(message.author.id); // Supprime la session de pari

                    // Mettre à jour les cotes
                    updateCoteChannels();
                });
            });
        });
    }
});

function updateCoteChannels() {
    const getCotesQuery = `
        SELECT p.choix1, p.choix2, 
        (SELECT SUM(mise) FROM bank_paris WHERE pari_id = p.id AND choix = p.choix1) AS sommeChoix1, 
        (SELECT SUM(mise) FROM bank_paris WHERE pari_id = p.id AND choix = p.choix2) AS sommeChoix2 
        FROM paris p 
        ORDER BY p.id DESC LIMIT 1`;

    connection.query(getCotesQuery, (error, results) => {
        if (error) {
            return console.error('Erreur lors de la récupération des cotes :', error);
        }

        if (results.length > 0) {
            const pari = results[0];
            const sommeChoix1 = results[0].sommeChoix1 || 0;
            const sommeChoix2 = results[0].sommeChoix2 || 0;

            let coteChoix1 = sommeChoix2 > 0 ? (sommeChoix2 / sommeChoix1).toFixed(2) : 1.00;
            let coteChoix2 = sommeChoix1 > 0 ? (sommeChoix1 / sommeChoix2).toFixed(2) : 1.00;

            coteChoix1 = Math.max(coteChoix1, 1.10).toFixed(2);
            coteChoix2 = Math.max(coteChoix2, 1.10).toFixed(2);

            if (coteChannelA) {
                coteChannelA.setName(`Cote ${pari.choix1}: ${coteChoix1}`).catch(console.error);
            }
            if (coteChannelB) {
                coteChannelB.setName(`Cote ${pari.choix2}: ${coteChoix2}`).catch(console.error);
            }
        }
    });
}

client.login(token);
(async () => {
    loadDatabase();
    connection.connect(function (error) {
        if (error) {
            console.error('Erreur de connexion à la base de données :', error);
        } else {
            console.log("Base de données connectée avec succès !");
        }
    });
})();
