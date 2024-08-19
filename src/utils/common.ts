export const getYouTubeVideoIdFromUrl = (url: string) => {
  const youtubeIdFromUrlRegex =
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:\S+)?$/;
  const match = url.match(youtubeIdFromUrlRegex);

  return match && match[1] ? match[1] : null;
};

// Hàm lấy Playlist ID từ URL
export const getYouTubePlaylistIdFromUrl = (url: string) => {
  const youtubePlaylistIdFromUrlRegex = /[&?]list=([^&]+)/i;
  const match = url.match(youtubePlaylistIdFromUrlRegex);

  return match && match[1] ? match[1] : null;
};

export const jsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return undefined;
  }
};

export const jsonStringify = (value: any) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return undefined;
  }
};

export const removeNumberFromEndOfString = (str: string) => {
  return str.replace(/\d+$/, '');
};

export const mapName = (memberId: string) => {
  if (process.env[memberId]) {
    return process.env[memberId];
  }

  return undefined;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
