import { createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import { Readable } from "stream";

export const playResource = (input: Readable | string, guildMember: GuildMember) => {
  const player = createAudioPlayer();

  const resource = createAudioResource(input);

  const voiceConnection = joinVoiceChannel({
    channelId: guildMember.voice.channel.id,
    guildId: guildMember.guild.id,
    adapterCreator: guildMember.guild.voiceAdapterCreator,
  });

  voiceConnection.subscribe(player);
  player.play(resource);

  return player
}
