'use client';

import { useSound } from '@/components/sound/SoundContext';
import { useMusic } from '@/components/sound/MusicContext';

/**
 * A utility hook that provides easy access to sound and music functionality
 * with more specific game-related actions
 */
export function useAudio() {
  const { playSoundEffect, soundEnabled, setSoundEnabled } = useSound();
  const { playMusic, stopMusic, musicEnabled, setMusicEnabled } = useMusic();

  // Play UI interaction sounds
  const playUISound = () => {
    playSoundEffect('click');
  };

  // Play combat sounds
  const playCombatSound = (type: 'attack' | 'victory' | 'defeat') => {
    playSoundEffect(type);
  };

  // Play reward sounds
  const playRewardSound = () => {
    playSoundEffect('reward');
  };

  // Play level up sound
  const playLevelUpSound = () => {
    playSoundEffect('levelUp');
  };

  // Map of area names to music tracks
  const areaToMusic: {[key: string]: string} = {
    // These are examples and can be expanded based on game areas
    'Enchanted Forest': 'adventure',
    'Ancient Ruins': 'adventure',
    'Volcanic Wastes': 'adventure',
    'Abyssal Realm': 'adventure',
    // Add more areas as needed
  };

  // Play area-specific music
  const playAreaMusic = (area: string) => {
    // Default to adventure music if no specific track for the area
    const trackName = areaToMusic[area] || 'adventure';
    playMusic(trackName);
  };

  // Play scene-specific music
  const playSceneMusic = (scene: 'combat' | 'shop' | 'adventure' | 'main') => {
    // Map 'main' to 'mainTheme' for consistency with MUSIC_TRACKS
    const trackName = scene === 'main' ? 'mainTheme' : scene;
    playMusic(trackName);
  };

  return {
    // Base sound functions
    playSoundEffect,
    soundEnabled,
    setSoundEnabled,
    
    // Base music functions
    playMusic,
    stopMusic,
    musicEnabled,
    setMusicEnabled,
    
    // Specialized functions
    playUISound,
    playCombatSound,
    playRewardSound,
    playLevelUpSound,
    playAreaMusic,
    playSceneMusic,
  };
}
