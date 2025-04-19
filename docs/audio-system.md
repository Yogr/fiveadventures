# Audio System Documentation

This document describes the audio system implemented in Five Adventures, including how to use it and how to extend it.

## Overview

The audio system consists of two main components:

1. **Music System**: For background music that plays continuously (one track at a time)
2. **Sound Effects System**: For short sound effects triggered by user actions or game events

Both systems have their own toggle controls and settings that are saved to the user's profile in the database. These settings are debounced to prevent excessive database writes.

## File Structure

The audio system consists of the following files:

- `src/components/sound/SoundContext.tsx` - Context provider for sound effects
- `src/components/sound/MusicContext.tsx` - Context provider for background music
- `src/components/sound/AudioProviders.tsx` - Combines both providers for easy inclusion
- `src/components/sound/SoundControls.tsx` - UI controls for toggling music and sound
- `src/lib/audio-utils.ts` - Utility functions for using audio throughout the app
- `public/sounds/` - Directory for sound effect files
- `public/music/` - Directory for music files

## Database Tables

User settings for music and sound are stored in the database:

```sql
ALTER TABLE users
ADD COLUMN music_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN sound_enabled BOOLEAN NOT NULL DEFAULT false;
```

The settings are loaded when the user logs in and updated when the user changes them.

## Using the Audio System

### Playing Sound Effects

To play a sound effect, use the `useAudio` hook:

```tsx
import { useAudio } from '@/lib/audio-utils';

function MyComponent() {
  const { playSoundEffect, playUISound, playCombatSound } = useAudio();
  
  // Play a general sound effect
  playSoundEffect('soundName');
  
  // Play UI interaction sound
  playUISound();
  
  // Play combat-related sound
  playCombatSound('attack');
  
  // ...
}
```

### Playing Background Music

To play background music, use the `useAudio` hook:

```tsx
import { useAudio } from '@/lib/audio-utils';

function MyComponent() {
  const { playMusic, playSceneMusic } = useAudio();
  
  // Play specific music track
  playMusic('trackName');
  
  // Play scene-specific music
  playSceneMusic('combat');
  
  // ...
}
```

For components that load when the app starts, you can use an effect:

```tsx
useEffect(() => {
  playSceneMusic('shop');
}, [playSceneMusic]);
```

### Adding Sound Effects to User Actions

Add sound effects to user actions by calling the appropriate function:

```tsx
// Example: Button click with sound
<button 
  onClick={() => {
    playUISound();
    handleAction();
  }}
>
  Click Me
</button>
```

## Adding New Sound Effects and Music

### Sound Effects

1. Add your sound effect files to the `/public/sounds/` directory (MP3 format recommended)
2. Update the `SOUND_EFFECTS` mapping in `src/components/sound/SoundContext.tsx`:

```tsx
const SOUND_EFFECTS: Record<string, string> = {
  // Existing sounds
  attack: '/sounds/attack.mp3',
  levelUp: '/sounds/level-up.mp3',
  // Add your new sound
  myNewSound: '/sounds/my-new-sound.mp3',
};
```

3. Use the sound in your components:

```tsx
playSoundEffect('myNewSound');
```

### Music Tracks

1. Add your music files to the `/public/music/` directory (MP3 format recommended)
2. Update the `MUSIC_TRACKS` mapping in `src/components/sound/MusicContext.tsx`:

```tsx
const MUSIC_TRACKS: Record<string, string> = {
  // Existing tracks
  mainTheme: '/music/main-theme.mp3',
  combat: '/music/combat.mp3',
  // Add your new music track
  myNewTrack: '/music/my-new-track.mp3',
};
```

3. Use the music in your components:

```tsx
playMusic('myNewTrack');
```

## Volume Control

Currently, the system has hardcoded volume levels:
- Sound effects: 50% volume
- Background music: 30% volume

These can be adjusted in the SoundContext.tsx and MusicContext.tsx files.

## Future Enhancements

Possible future enhancements include:

1. Volume sliders for music and sound effects
2. Different sound effect categories with separate toggles
3. Music transitions (fade in/out)
4. Sound effect prioritization for overlapping sounds
5. Sound effect localization (left/right channels)
6. Audio sprites for more efficient loading
