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
  const map = {
    '662105091893100575': 'Hoàng abc',
    '593815497737240586': 'bé Khâu',
    '335633359218671616': 'triết',
    '709347560178974790': 'bạn đã đến với bình nguyên vô tận',
    '580607556137779230': 'Thuỳ dương',
    '747873639872856194': 'minh gầy',
    '872830927099797584': 'Thành có vợ',
    '424836030168956929': 'thành wibu',
    '602506286126596100': ' nê du quy',
  };

  if (map[memberId]) {
    return map[memberId];
  }

  return undefined;
};
