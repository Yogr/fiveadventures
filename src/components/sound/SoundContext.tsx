'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { updateUserSettings } from '@/app/actions/user-settings';
import { useDebounce } from '@/lib/client-utils';

// Define context types
type SoundContextType = {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSoundEffect: (soundName: string) => void;
};

// Create context with default values
const SoundContext = createContext<SoundContextType>({
  soundEnabled: false,
  setSoundEnabled: () => {},
  playSoundEffect: () => {},
});

// Define sound effects mapping using the actually available sound files
const SOUND_EFFECTS: Record<string, string> = {
  // Map to actual files in public/sounds directory
  attack: '/sounds/attack.mp3',
  click: '/sounds/click.mp3',
  fireball: '/sounds/fireball.mp3',
  openInventory: '/sounds/open_inventory.mp3',
  splat: '/sounds/splat.mp3',
  
  // Map missing sounds to existing ones as fallbacks
  levelUp: '/sounds/click.mp3',      // Using click as fallback
  reward: '/sounds/open_inventory.mp3', // Using open_inventory as fallback
  victory: '/sounds/fireball.mp3',   // Using fireball as fallback
  defeat: '/sounds/splat.mp3',       // Using splat as fallback
};

export function SoundProvider({ 
  children,
  initialSoundEnabled = false, 
  userId 
}: { 
  children: React.ReactNode;
  initialSoundEnabled?: boolean;
  userId?: string;
}) {
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const soundHowls = useRef<Record<string, Howl>>({});
  
  // Debounce the sound setting change to avoid too many DB updates
  const debouncedSoundEnabled = useDebounce(soundEnabled, 5000);

  // Save sound setting to DB when it changes (debounced)
  useEffect(() => {
    if (userId) {
      updateUserSettings({
        userId,
        soundEnabled: debouncedSoundEnabled
      });
    }
  }, [debouncedSoundEnabled, userId]);

  // Create Howl instances for sound effects (lazy loading)
  const getSoundEffect = useCallback((soundName: string): Howl | null => {
    if (!SOUND_EFFECTS[soundName]) {
      console.warn(`Sound effect "${soundName}" not found`);
      return null;
    }

    if (!soundHowls.current[soundName]) {
      console.log(`Creating new Howl instance for sound: ${soundName}`);
      soundHowls.current[soundName] = new Howl({
        src: [SOUND_EFFECTS[soundName]],
        volume: 0.5,
        preload: true,
        html5: true,
        onload: () => console.log(`Sound effect loaded: ${soundName}`),
        onloaderror: (id, error) => console.error(`Error loading sound ${soundName}:`, error),
        onplayerror: (id, error) => console.error(`Error playing sound ${soundName}:`, error),
        onplay: () => console.log(`Sound effect started playing: ${soundName}`),
        onend: () => console.log(`Sound effect ended: ${soundName}`),
      });
    }

    return soundHowls.current[soundName];
  }, []);

  // Play a sound effect
  const playSoundEffect = useCallback((soundName: string) => {
    //console.log(`Playing sound effect: ${soundName}`);
    if (!soundEnabled) return;
    
    const sound = getSoundEffect(soundName);
    //console.log(`Sound effect instance:`, sound);
    if (sound) {
      sound.play();
      //console.log(`Sound effect "${soundName}" played`);
    }
  }, [soundEnabled, getSoundEffect]);

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        playSoundEffect,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

// Custom hook for using the sound context
export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
