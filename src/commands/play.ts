import { CmdType } from '.';
import { GuildMember, SlashCommandBuilder } from 'discord.js';
import {
  AudioPlayerStatus,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import { createAudioPlayer } from '@discordjs/voice';
// import ytdl from "ytdl-core";
import play, { SoundCloudStream, YouTubeStream, YouTubeVideo } from 'play-dl';
import { getYouTubeVideoIdFromUrl } from '../utils/common';

export const Play: CmdType = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play song!')
    .addStringOption((option) =>
      option.setName('search').setDescription('Youtube link.').setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    // const url = "https://www.youtube.com/watch?v=71bXPAIVwAE";
    // const mp3 = "assets/koyoi-mofumofu.mp3";

    const guildMember = interaction.member as GuildMember;
    let searchText = interaction.options.getString('search', true);

    if (searchText.startsWith('https://')) {
      searchText = getYouTubeVideoIdFromUrl(searchText);

      if (!searchText) {
        await interaction.followUp({
          content: 'Không tìm thấy video nào!',
          ephemeral: true,
        });
        return;
      }
    }

    const player = createAudioPlayer();

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('The audio player has started playing!');
    });

    player.on('error', (error) => {
      console.error(`Player error: ${error.message} with resource`);
      console.log(error);
    });

    try {
      // Disabling chunking is recommended in Discord bots
      // const stream = ytdl(url, { filter: "audioonly", dlChunkSize: 0 });
      // const resource = createAudioResource(stream);
      // player.play(resource);

      // play-dl
      let stream2: YouTubeStream | SoundCloudStream;

      let yt_info: YouTubeVideo[] = await play.search(searchText, {
        limit: 1,
      });
      console.log(yt_info[0].title);
      console.log(yt_info[0].durationRaw);
      console.log('---');

      if (yt_info?.length <= 0) {
        await interaction.followUp({
          content: 'Không tìm thấy video nào!',
          ephemeral: true,
        });
        return;
      }

      stream2 = await play.stream(yt_info[0]?.url);

      const resource2 = createAudioResource(stream2.stream, {
        inputType: stream2.type,
      });
      player.play(resource2);

      const voiceConnection = joinVoiceChannel({
        channelId: guildMember.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const subscription = voiceConnection.subscribe(player);

      // subscription could be undefined if the connection is destroyed!
      if (subscription) {
        // Unsubscribe after 10 seconds (stop playing audio on the voice connection)
        // setTimeout(() => subscription.unsubscribe(), 10000);
      }
    } catch (error) {
      console.log('Stream error: ');
      console.log(error);
    }

    // setTimeout(() => {
    //   voiceConnection.destroy();
    // }, 20000);

    await interaction.followUp({
      content: `Playing ${searchText}`,
      ephemeral: true,
    });
  },
};
