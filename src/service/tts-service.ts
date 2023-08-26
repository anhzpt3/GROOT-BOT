import axios from "axios";
import fs from "fs";
import util from "util";

export const getVoiceFromText = async (text: string) => {
  const request = {
    input: { text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "vi-VN", name: "vi-VN-Wavenet-B" },
    // select the type of audio encoding
    audioConfig: {
      audioEncoding: "LINEAR16",
      effectsProfileId: ["small-bluetooth-speaker-class-device"],
      pitch: 0,
      speakingRate: 0.95,
    },
  };

  const res = await axios.post(
    `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`,
    request
  );

  const folderTempPath = "./.temp/tts";
  const outputFilePath = `${folderTempPath}/output.mp3`;

  // Create the temporary directory if it doesn't exist
  await fs.promises.mkdir(folderTempPath, { recursive: true });

  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(
    outputFilePath,
    Buffer.from(res.data.audioContent, "base64"),
    "binary"
  );

  return outputFilePath;
}