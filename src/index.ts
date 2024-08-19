import {
  Client,
  Events,
  GatewayIntentBits,
  VoiceState,
  ChannelType,
  GuildMember,
} from 'discord.js';
import { initCommands } from './commands';
import express from 'express';
import 'dotenv/config';
import { getVoiceFromText } from './service/tts-service';
import { playResource } from './service/player-service';
import { channel } from 'diagnostics_channel';
import { joinVoiceChannel } from '@discordjs/voice';
import { delay, mapName, removeNumberFromEndOfString } from './utils/common';

const app = express();
const commands = initCommands();

// For testing purposes
// tạo API gọi vào app
app.get('/', (req, res) => {
  res.send('<h2>Nyanz is Working!</h2>');
});

// khởi tạo app với PORT
app.listen(process.env.PORT, () => {
  console.log(`API is listening on port ${process.env.PORT}\n`);
});

// Create a new client instance
// Khởi tạo client discord
const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// bắt sự kiện tương tác lệnh
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

// When the client is ready, run this code (only once)
// sự kiện bot đã sẵn sàng
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c: Client) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);

  client.user.setActivity('gái');
  // Hoặc
  // client.user.setActivity('game gì đó', { type: ActivityType.Playing });
});

// Log in to Discord with your client's token
// login = token
client.login(process.env.DISCORD_BOT_TOKEN);

// sự kiện kênh voice
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (newState.channel?.id === oldState.channel?.id) {
    // nếu ko phải sự kiện vào/thoát
    return;
  }

  if (oldState.member.user.bot || newState.member.user.bot) {
    // nếu là bot
    return;
  }

  // chỉ lấy các voice channel
  const voiceChannels = newState.guild.channels.cache.filter(
    (channel) => channel.type === ChannelType.GuildVoice
  );

  //kiểm tra xem bot "groot" có đang trong kênh thoại nào
  const botNotInAnyChannel = voiceChannels.every((channel) => {
    const membersInChannel = channel.members as Map<string, GuildMember>;
    // nếu member trong channel mà có id của bot --> trả về false
    return !membersInChannel.get(client.user.id); // client.user.id = bot id = với DISCORD_CLIENT_ID
  });

  // nếu là user vào voice
  if (newState.channel?.id) {
    const botInVoiceChannel = getGrootBotInVoiceState(newState);
    const member = newState.member;
    let name = member.nickname || member.displayName || member.user.username;
    name = removeNumberFromEndOfString(name);
    name = mapName(member.id) || name;

    // nếu ng dùng vào voice mà có bot ở trong
    if (botInVoiceChannel) {
      const text = `chào mừng ${name}`;
      console.log(text);
      console.log('----');

      // delay 200ms
      await delay(200);

      // if Hg --> play custom sound
      if (member.id === '662105091893100575') {
        playResource('./assets/nyaa.mp3', botInVoiceChannel);
        return;
      }

      const outputFilePath = await getVoiceFromText(text);
      playResource(outputFilePath, botInVoiceChannel);
      //
    } else {
      // nếu vào voice khác ko có bot ở trong
      // nếu bot không ở trong voice nào thì di chuyển bot vào kênh mới của người dùng
      if (botNotInAnyChannel) {
        joinVoiceChannel({
          channelId: newState.channel.id,
          guildId: newState.guild.id,
          adapterCreator: newState.guild.voiceAdapterCreator,
        });

        // if Hg --> play custom sound - testing
        if (member.id === '662105091893100575') {
          console.log('start delay');
          await delay(500);
          console.log('done delay');
          playResource('./assets/nyaa.mp3', botInVoiceChannel);
          console.log('done play');
        }
      } else {
        // nếu bot ở kênh không có user thì disconnect
        disconnectBotIfNoUser(oldState);
      }
    }
  }

  // nếu là user thoát voice(disconnect)
  if (!newState.channel) {
    disconnectBotIfNoUser(oldState);
  }
});

const disconnectBotIfNoUser = (oldState: VoiceState) => {
  const botInVoiceChannel = getGrootBotInVoiceState(oldState);
  // nếu kênh voice đã thoát có bot ở trong
  if (botInVoiceChannel?.id) {
    const membersInChannel = botInVoiceChannel.voice.channel.members;
    // Kiểm tra nếu kênh thoại chỉ còn các bot khác và không có người dùng nào
    const onlyBotsInChannel = membersInChannel.every(
      (member) => member.user.bot
    );
    if (onlyBotsInChannel) {
      // Di chuyển bot "Groot" ra khỏi kênh thoại
      botInVoiceChannel.voice.disconnect();
    }
  }
};

const getGrootBotInVoiceState = (state: VoiceState) => {
  return state.channel?.members?.get(process.env.DISCORD_CLIENT_ID);
};
