# Music Directory

This directory is for storing background music files used throughout the Five Adventures game.

## Recommended Music Files

Place your music files in this directory with the following names:

- `main-theme.mp3` - For the game's main menu and title screen
- `combat.mp3` - For combat sequences
- `adventure.mp3` - For adventure/exploration screens
- `shop.mp3` - For the shop interface
- `victory.mp3` - For victory celebrations

You can add more music tracks and update the `MUSIC_TRACKS` mapping in `src/components/sound/MusicContext.tsx` to include your new music files.

## File Format

MP3 format is recommended for broad browser compatibility, but you can also use other formats supported by Howler.js such as WAV or WebM.

## Notes

- Music files should be optimized for web (128kbps is usually a good balance between quality and file size)
- Consider providing loopable music tracks where appropriate
- Aim for music tracks that are around 1-3 minutes in length to avoid excessive file sizes
- Make sure to use music that you have the rights to use in your application
- The music volume is set to 30% by default in the MusicContext to avoid overwhelming sound effects
