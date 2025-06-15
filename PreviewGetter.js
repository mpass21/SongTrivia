const spotifyPreviewFinder = require('spotify-preview-finder');

// Set environment variables programmatically
process.env.SPOTIFY_CLIENT_ID = 'your_client_id';
process.env.SPOTIFY_CLIENT_SECRET = 'your_client_secret';

async function searchSongs() {
  try {
    // Search for multiple songs
    const songs = [
      await spotifyPreviewFinder('Bohemian Rhapsody', 1),
      await spotifyPreviewFinder('Hotel California', 1),
      await spotifyPreviewFinder('Imagine', 1)
    ];

    songs.forEach(result => {
      if (result.success && result.results.length > 0) {
        const song = result.results[0];
        console.log(`\nFound: ${song.name}`);
        console.log(`Preview URL: ${song.previewUrls[0]}`);
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}