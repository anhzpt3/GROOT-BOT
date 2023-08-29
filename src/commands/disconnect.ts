import { CmdType } from '.';
import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

export const DisconnectCommand: CmdType = {
  data: new SlashCommandBuilder()
    .setName('cook')
    .setDescription('Disconnect the bot from the voice channel'),
  execute: async (interaction) => {
    const guildMember = interaction.member as GuildMember;

    const voiceConnection = getVoiceConnection(guildMember.guild.id);
    if (voiceConnection) {
      voiceConnection.destroy();
      await interaction.reply('Tao đi nấu đây.');
    } else {
      await interaction.reply('Tao có trong phòng đâu mà đuổi.');
    }
  },
};
