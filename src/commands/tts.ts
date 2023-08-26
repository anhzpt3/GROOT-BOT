// import textToSpeech from "@google-cloud/text-to-speech";
import { CmdType } from ".";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import {
  AudioPlayerStatus,
} from "@discordjs/voice";
import { getVoiceFromText } from "../service/tts-service";
import { playResource } from "../service/player-service";

export const TextToSpeech: CmdType = {
  data: new SlashCommandBuilder()
    .setName("v")
    .setDescription("Text to speech!")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Enter text to voice")
        .setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const guildMember = interaction.member as GuildMember;

    let text = interaction.options.getString("text", true);

    const outputFilePath = await getVoiceFromText(text);
    const player = playResource(outputFilePath, guildMember)

    player.on(AudioPlayerStatus.Playing, () => {
      console.log(
        `${guildMember.nickname || interaction.user.username} speaking: ` + text
      );
    });

    player.on("error", (error) => {
      console.error(`Player error: ${error.message} with resource`);
      console.log(error);
    });

    await interaction.followUp({
      content: `Speaking ${text}`,
      ephemeral: true,
    });
  },
};
