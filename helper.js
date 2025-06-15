// helpers/spotifyHelpers.js

export const fetchRandomTrack = async (token) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (data.items.length > 0) {
      const randomTrack = data.items[Math.floor(Math.random() * data.items.length)];
      return randomTrack;
    }
    return null;
  } catch (error) {
    console.error('Error fetching track:', error);
    return null;
  }
};

export const pause = async (accessToken) => {
  await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

export const play = async (accessToken, uri) => {
  await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [uri] }),
  });
};

export const startRound = async ({ accessToken, setStatus, setTrackTitle, setShowInput, setCountdown }) => {
  setShowInput(false);
  setStatus("Pausing...");
  await pause(accessToken);

  // Countdown
  setCountdown(3);
  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev === 1) {
        clearInterval(interval);
        setCountdown(0);
      }
      return prev - 1;
    });
  }, 1000);

  await new Promise(res => setTimeout(res, 3000));

  setStatus("Fetching track...");
  const track = await fetchRandomTrack(accessToken);
  if (track?.uri) {
    setTrackTitle(track.name);
    setStatus("Playing... Make your guess!");
    await play(accessToken, track.uri);
    setShowInput(true);
  } else {
    setStatus("No track found.");
  }
};
