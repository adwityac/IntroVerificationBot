const { Client, GatewayIntentBits, Collection, ActivityType, PresenceUpdateStatus, Partials } = require('discord.js');
const { exec } = require('child_process');
require('dotenv').config();
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages, // Ensure you have this intent
        GatewayIntentBits.MessageContent  // Required to read message content
    ],
    partials: [Partials.Channel] // Required to read DMs
});

// Run the deploy-commands.js script
exec('node deploy-command.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing deploy-commands.js: ${error}`);
        return;
    }
    console.log(`deploy-commands.js output: ${stdout}`);
    if (stderr) {
        console.error(`deploy-commands.js stderr: ${stderr}`);
    }

    // Load commands and events after deploying commands
    commandHandler(client);
    eventHandler(client);

    client.on('messageCreate', async message => {
        if (message.guild) {
            if (message.channel.name === 'intros') {
                const { isValid, errors } = validateIntroMessage(message.content);
                
                if (!isValid) {
                    await message.reply(`Please correct your introduction:\n${errors.join('\n')}`);
                } else {
                    // Handle valid introductions if needed
                }
            }
        } else {
            // Handle DMs
            console.log('Received a DM:', message.content); // Debugging log

            const guild = client.guilds.cache.get(process.env.GUILD_ID); // Use your guild ID
            if (!guild) {
                console.error('Guild not found. Please check your GUILD_ID.');
                return;
            }

            const serverAvatar = guild.iconURL();

            const embed = new EmbedBuilder()
                .setTitle(`Open a ticket in ${guild.name}`)
                .setDescription('Do you want to open a ticket?')
                .setThumbnail(serverAvatar)
                .setColor(0x00AE86);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_yes')
                    .setLabel('✅ Yes')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_no')
                    .setLabel('❌ No')
                    .setStyle(ButtonStyle.Danger)
            );

            try {
                await message.author.send({ embeds: [embed], components: [row] });
            } catch (error) {
                console.error('Error sending DM to user:', error);
            }
        }
    });

    client.once('ready', () => {
        console.log(`Logged in as ${client.user.tag} and ready to go!`);

        // Set the bot's initial status and activity
        client.user.setPresence({
            activities: [{ name: 'a game', type: ActivityType.Playing }],
            status: PresenceUpdateStatus.Online,
        });

        // Example of changing status periodically
        const statuses = [
            { name: 'Hum gay hain hume server ke liye log chaiye', type: ActivityType.Playing },
            // { name: 'Hum gay hain hume server ke liye log chaiye', type: ActivityType.Playing },
            // { name: 'Server ke loog', type: ActivityType.Watching },
            // { name: 'Hum gay hain hume server ke liye log chaiye', type: ActivityType.Watching },
            // { name: 'LGBTQIndiA zindabad', type: ActivityType.Listening },
        ];

        setInterval(() => {
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            client.user.setActivity(randomStatus.name, { type: randomStatus.type });
        }, 10000); // Change status every 10 seconds
    });

    client.login(process.env.MY_DISCORD_BOT_TOKEN).catch(error => {
        console.error("Error logging in:", error);
    });
});