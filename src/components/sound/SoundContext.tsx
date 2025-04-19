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

// Define sound effects mapping - these will be placeholders until actual files are provided
const SOUND_EFFECTS: Record<string, string> = {
  // Examples - these paths don't exist yet, but will be replaced with actual sound files
  attack: '/sounds/attack.mp3',
  levelUp: '/sounds/level-up.mp3',
  click: '/sounds/click.mp3',
  reward: '/sounds/reward.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  // Add more sound effects as needed
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
      soundHowls.current[soundName] = new Howl({
        src: [SOUND_EFFECTS[soundName]],
        volume: 0.5,
        preload: false, // Don't preload until needed
      });
    }

    return soundHowls.current[soundName];
  }, []);

  // Play a sound effect
  const playSoundEffect = useCallback((soundName: string) => {
    if (!soundEnabled) return;
    
    const sound = getSoundEffect(soundName);
    if (sound) {
      sound.play();
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
