'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { updateUserSettings } from '@/app/actions/user-settings';
import { useDebounce } from '@/lib/utils';

// Define context types
type MusicContextType = {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  currentTrack: string | null;
  playMusic: (trackName: string) => void;
  stopMusic: () => void;
};

// Create context with default values
const MusicContext = createContext<MusicContextType>({
  musicEnabled: false,
  setMusicEnabled: () => {},
  currentTrack: null,
  playMusic: () => {},
  stopMusic: () => {},
});

// Define music tracks mapping - these will be placeholders until actual files are provided
const MUSIC_TRACKS: Record<string, string> = {
  // Examples - these paths don't exist yet, but will be replaced with actual music files
  mainTheme: '/music/main-theme.mp3',
  combat: '/music/combat.mp3',
  adventure: '/music/adventure.mp3',
  shop: '/music/shop.mp3',
  victory: '/music/victory.mp3',
  // Add more music tracks as needed
};

export function MusicProvider({ 
  children,
  initialMusicEnabled = false, 
  userId 
}: { 
  children: React.ReactNode;
  initialMusicEnabled?: boolean;
  userId?: string;
}) {
  const [musicEnabled, setMusicEnabled] = useState(initialMusicEnabled);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const musicHowls = useRef<Record<string, Howl>>({});
  const currentHowl = useRef<Howl | null>(null);
  
  // Debounce the music setting change to avoid too many DB updates
  const debouncedMusicEnabled = useDebounce(musicEnabled, 5000);

  // Save music setting to DB when it changes (debounced)
  useEffect(() => {
    if (userId) {
      updateUserSettings({
        userId,
        musicEnabled: debouncedMusicEnabled
      });
    }
  }, [debouncedMusicEnabled, userId]);

  // Create Howl instances for music tracks (lazy loading)
  const getMusicTrack = useCallback((trackName: string): Howl | null => {
    if (!MUSIC_TRACKS[trackName]) {
      console.warn(`Music track "${trackName}" not found`);
      return null;
    }

    if (!musicHowls.current[trackName]) {
      musicHowls.current[trackName] = new Howl({
        src: [MUSIC_TRACKS[trackName]],
        volume: 0.3,
        loop: true,
        preload: false, // Don't preload until needed
      });
    }

    return musicHowls.current[trackName];
  }, []);

  // Play a music track
  const playMusic = useCallback((trackName: string) => {
    if (!musicEnabled) return;
    
    // Stop current track if any
    if (currentHowl.current) {
      currentHowl.current.stop();
    }
    
    const music = getMusicTrack(trackName);
    if (music) {
      music.play();
      currentHowl.current = music;
      setCurrentTrack(trackName);
    }
  }, [musicEnabled, getMusicTrack]);

  // Stop current music
  const stopMusic = useCallback(() => {
    if (currentHowl.current) {
      currentHowl.current.stop();
      currentHowl.current = null;
      setCurrentTrack(null);
    }
  }, []);

  // When music is toggled off, stop any playing music
  useEffect(() => {
    if (!musicEnabled && currentHowl.current) {
      stopMusic();
    }
  }, [musicEnabled, stopMusic]);

  return (
    <MusicContext.Provider
      value={{
        musicEnabled,
        setMusicEnabled,
        currentTrack,
        playMusic,
        stopMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

// Custom hook for using the music context
export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
