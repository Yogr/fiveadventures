'use client';

import { useSound } from '@/components/sound/SoundContext';
import { useMusic } from '@/components/sound/MusicContext';

// Flag to enable global music mode (single track throughout the app)
const GLOBAL_MUSIC_MODE = true;

/**
 * A utility hook that provides easy access to sound and music functionality
 * with more specific game-related actions
 */
export function useAudio() {
  const { playSoundEffect, soundEnabled, setSoundEnabled } = useSound();
  const { playMusic, stopMusic, musicEnabled, setMusicEnabled } = useMusic();

  // Play UI interaction sounds
  const playUISound = () => {
    //console.log('Playing UI sound');
    playSoundEffect('click');
  };

  // Play combat sounds - mapping to available sound files
  const playCombatSound = (type: 'attack' | 'victory' | 'defeat') => {
    //console.log(`Playing combat sound: ${type}`);
    if (type === 'attack') {
      playSoundEffect('attack');
    } else if (type === 'victory') {
      playSoundEffect('victory');  // Maps to fireball.mp3 as defined in SoundContext
    } else if (type === 'defeat') {
      playSoundEffect('defeat');   // Maps to splat.mp3 as defined in SoundContext
    }
  };

  // Play reward sounds
  const playRewardSound = () => {
    //console.log('Playing reward sound');
    playSoundEffect('reward');     // Maps to open_inventory.mp3 as defined in SoundContext
  };

  // Play level up sound
  const playLevelUpSound = () => {
    //console.log('Playing level up sound');
    playSoundEffect('levelUp');    // Maps to click.mp3 as defined in SoundContext
  };

  const playInventoryOpenSound = () => {
    //console.log('Playing inventory open sound');
    playSoundEffect('openInventory'); // Maps to open_inventory.mp3 as defined in SoundContext
  }

  const playInventoryCloseSound = () => {
    //console.log('Playing inventory close sound');
    playSoundEffect('click'); // Maps to click.mp3 as defined in SoundContext
  }

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
    //console.log(`Playing music for area: ${area}`);
    
    // In global music mode, we only log but don't actually change music
    if (GLOBAL_MUSIC_MODE) {
      console.log(`Global music mode: keeping main theme instead of switching to area music for "${area}"`);
      return;
    }
    
    // Default to adventure music if no specific track for the area
    const trackName = areaToMusic[area] || 'adventure';
    playMusic(trackName);
  };

  // Play scene-specific music
  const playSceneMusic = (scene: 'combat' | 'shop' | 'adventure' | 'main') => {
    console.log(`Playing music for scene: ${scene}`);
    
    // In global music mode, only allow playing the main theme
    if (GLOBAL_MUSIC_MODE && scene !== 'main') {
      console.log(`Global music mode: keeping main theme instead of switching to "${scene}" music`);
      return;
    }
    
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
    playInventoryOpenSound,
    playInventoryCloseSound,
  };
}
