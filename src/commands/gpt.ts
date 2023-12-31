import { CmdType } from '.';
import { SlashCommandBuilder } from 'discord.js';
import { jsonParse } from '../utils/common';

export const ChatGPT: CmdType = {
  data: new SlashCommandBuilder()
    .setName('groot')
    .setDescription('Mười vạn câu hỏi Lmao :)')
    .addStringOption((option) =>
      option.setName('search').setDescription('chat GPT').setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply(); // bot suy nghĩ

    try {
      let text = interaction.options.getString('search', true);

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            temperature: 0.2,
            max_tokens: 1100,
            messages: [
              {
                role: 'user',
                content: text,
              },
            ],
            stream: true,
          }),
        }
      );
      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();

      if (!reader) return;

      let finalData = `> ${text} \n\n`;
      const message = await interaction.followUp(finalData);

      let dataDone = false;

      const interval = setInterval(async () => {
        try {
          if (dataDone) {
            clearInterval(interval);
            finalData += '\n\n :cat:';
            await message.edit(finalData);
          }

          await message.edit(finalData);
        } catch (error) {
          console.log('error when reply message: ' + finalData);
          clearInterval(interval);
        }
      }, 1000);

      while (!dataDone) {
        const { value, done } = await reader.read();
        if (done) break;

        const arr = value.split('\n');

        for (const data of arr) {
          if (data.length === 0 || data.startsWith(':')) {
            continue;
          }

          if (data === 'data: [DONE]') {
            dataDone = true;
          }

          const json = jsonParse(data.substring(6));
          const content = json?.choices[0]?.delta?.content;

          if (content) {
            finalData += content;
          }
          if (dataDone) {
            break;
          }
        }
      }
    } catch (error) {
      console.log(error.name);

      try {
        await interaction.reply({
          content:
            'có lỗi đã xảy ra, 1 là hết tiền API openAI rồi, 2 là t cũng đéo biết nữa',
        });
      } catch (errorReyly) {
        console.log('error when reply: ' + errorReyly.name);
      }
    }
  },
};
