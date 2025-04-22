'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Howl } from 'howler';
import { updateUserSettings } from '@/app/actions/user-settings';
import { useDebounce } from '@/lib/client-utils';

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
      console.log(`Creating new Howl instance for: ${trackName}`);
      musicHowls.current[trackName] = new Howl({
        src: [MUSIC_TRACKS[trackName]],
        volume: 0.15,
        loop: true,
        preload: true, // Preload audio to ensure it's ready
        html5: true,   // Use HTML5 Audio for better handling of larger files
        onload: () => console.log(`Music successfully loaded: ${trackName}`),
        onloaderror: (id, error) => console.error(`Error loading music ${trackName}:`, error),
        onplayerror: (id, error) => console.error(`Error playing music ${trackName}:`, error),
        onplay: () => console.log(`Music started playing: ${trackName}`),
        onstop: () => console.log(`Music stopped: ${trackName}`),
        onend: () => console.log(`Music ended: ${trackName}`),
      });
    }

    return musicHowls.current[trackName];
  }, []);

  // Play a music track
  const playMusic = useCallback((trackName: string) => {
    //console.log(`Playing music: ${trackName}, enabled: ${musicEnabled}`);
    if (!musicEnabled) return;
    
    // Stop current track if any
    if (currentHowl.current) {
      currentHowl.current.stop();
    }
    
    const music = getMusicTrack(trackName);
    //console.log(`Music track loaded: ${music}`);
    if (music) {
      //console.log(`Playing music: ${trackName}`);
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
