# Sound Effects Directory

This directory is for storing sound effect files used throughout the Five Adventures game.

## Recommended Sound Effect Files

Place your sound effect files in this directory with the following names:

- `attack.mp3` - For attack actions in combat
- `levelUp.mp3` - For level up events
- `click.mp3` - For UI button clicks
- `reward.mp3` - For receiving rewards or items
- `victory.mp3` - For winning combat
- `defeat.mp3` - For losing combat

You can add more sound effects and update the `SOUND_EFFECTS` mapping in `src/components/sound/SoundContext.tsx` to include your new sound effects.

## File Format

MP3 format is recommended for broad browser compatibility, but you can also use other formats supported by Howler.js such as WAV or WebM.

## Notes

- Keep sound effect files small (under 100KB if possible) to reduce load times.
- Sound effects should be short and punchy for the best user experience.
- Make sure to use sounds that you have the rights to use in your application.
