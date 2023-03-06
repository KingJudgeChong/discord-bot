require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'ready',
    description: 'use this command to toggle buzz command',
  },
  {
    name: 'buzz',
    description: 'only one user can type buzz, use start command again after',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const { Client, GatewayIntentBits, DiscordAPIError } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
] });

let buzzStarted = false;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('voiceStateUpdate', async (exit, enter) => {
  const leftchannel = exit.channel;
  const joinchannel = enter.channel;

  if (leftchannel !== joinchannel) {
    if (joinchannel) {
      const channel = enter.channel;
      const user = enter.member.user;
      const role = channel.guild.roles.cache.find(role => role.name === 'Batch 10F');
      const roleMention = `<@&${role.id}>`;

      try {
        await channel.send(`${user.toString()} has joined the voice channel! ${roleMention}`);
      } catch (error) {
        console.error(`Failed to send message: ${error}`);
      }

    } else if (leftchannel) { 
      const channel = exit.channel;
      const user = exit.member.user;

      try {
        await channel.send(`${user.toString()} has left the voice channel!`);
      } catch (error) {
        console.error(`Failed to send message: ${error}`);
      }
      
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'ready') {
    buzzStarted = true;
    await interaction.reply(`<@${interaction.user.id}> **has started a buzz!** \n\n Type */buzz*`);
  }
  if (commandName === 'buzz') {
    if (buzzStarted) {
      buzzStarted = false;
      await interaction.reply(`<@${interaction.user.id}> \n \n **BUZZED FIRST!**`);
    } else {
      await interaction.reply(`***Sorry too late!***`);
    }
  }
});
client.login(process.env.BOT_TOKEN);